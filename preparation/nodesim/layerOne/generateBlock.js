import {totalCreditToken, minRemoteAttestatorsToPassRaTask, minBlockDelayRequiredBeforeComputeStart,
  maxBlockDelayRequiredBeforeComputeStart, initialCreditIssuedWhenPassRa, awardCreditWhenRaSuccessful, 
  penaltyCreditWhenRaFail, minComputeGroupMembersToStartCompute, reduceFactualIfRaFail} from '../shared/constValue';
const log=()=>{};//skip for now
import { o } from '../shared/utilities';

exports.generateBlock = async ()=>{
  const {ipfs, globalState, pubsubRooms} = global;
  const {blockRoom} = pubsubRooms;
  runSettlementBeforeNewBlock();
  globalState.creditMap = runCreditNormalization(globalState.creditMap, totalCreditToken);
  const {gasMap, creditMap, processedTxs, previousBlockHeight, previousBlockCid, escrowGasMap, pendingTasks} = globalState;
  
  //calculate totalCredit for online users
  const totalCreditForOnlineNodes = global.onlinePeerUserCache.getUserNameList().reduce((acc, u)=>{
    acc += creditMap[u];
    return acc;
  }, 0);

  //const peerProfile = globalState.peerProfile;

  const newBlock = {
    //peerProfile,
    gasMap,
    creditMap,
    processedTxs,
    blockHeight: previousBlockHeight + 1,
    previousBlockCid,
    totalCreditForOnlineNodes,
    escrowGasMap,
    pendingTasks
  };
  globalState.blockHeight = newBlock.blockHeight; 

  globalState.blockCid = "generating new block CID, please wait";//while generating block, set the blockCid to 0 for temperary because of async await, other code may run into globalState.blockCid while await is waiting for new blockCid.
  const newBlockCid = await ipfs.dag.put(newBlock);
  globalState.blockCid = newBlockCid.toBaseEncodedString();
  const broadcastObj = {
    txType:'newBlock',
    cid:newBlockCid.toBaseEncodedString(),
    height:newBlock.blockHeight
  }
  // console.log("before blockRoom broadcast, the obj,", broadcastObj)
  blockRoom.broadcast(JSON.stringify(broadcastObj))
  globalState.previousBlockHeight = globalState.blockHeight;
  globalState.processedTxs = [];
  global.blockMgr.pushNewBlock(broadcastObj.height, broadcastObj.cid);
  return newBlock;
}

const runSettlementBeforeNewBlock = ()=>{
  const {ipfs, globalState} = global;
  if(! globalState.pendingTasks)  return;

  const pendingTasks = globalState.pendingTasks;

  const promisesTasks = Object.keys(pendingTasks).map( async (taskCid)=>{
    const {type, initiator, followUps, startBlockHeight} = pendingTasks[taskCid];
    switch(type){
      case 'newNodeJoinNeedRa':{
        if(followUps.length < minRemoteAttestatorsToPassRaTask){
          break;//we have not reached the minimal requirement of the number of Remote Attestators
        }
        const promisesChildren = followUps.map( async (childCid)=>{
          return (await ipfs.dag.get(childCid)).value;
        });
        const allChildrenTasks = await Promise.all(promisesChildren);
        //console.log('before settleNewNodeRa, globalState gasMap, creditMap, pendingTasks', globalState.gasMap, globalState.creditMap, globalState.pendingTasks)
        if (settleNewNodeRa(initiator, taskCid, globalState, allChildrenTasks)){
          delete pendingTasks[taskCid];
        };
        //console.log('after settleNewNodeRa, globalState gasMap, creditMap, pendingTasks', globalState.gasMap, globalState.creditMap, globalState.pendingTasks)
        break;
      }//case
      case 'computeTask':{
        const {startBlockHeight, initiator, followUps} = pendingTasks[taskCid];
        if(global.blockMgr.getLatestBlockHeight()  - startBlockHeight < minBlockDelayRequiredBeforeComputeStart){
          console.log('we will need to wait more blocks until we can start computing. Let those slow nodes get more time responding the VRF');
          break;
        }
        if((global.blockMgr.getLatestBlockHeight()  - startBlockHeight) < maxBlockDelayRequiredBeforeComputeStart){
          if(followUps.length < minComputeGroupMembersToStartCompute){
            //we did not get enough member but time is not out yet. so we can keep waiting
            break;
          }
          else{
            //we did not wait enough time but the followUps number has reached the minimal requriement, so we can start now
            o('debug', 'we did not wait enough time but the followUps number has reached the minimal requriement, so we can start now');
            globalState.pendingTasks[taskCid].type = 'computeTaskStart';
            break;
          }
        }
        else{
          if(followUps.length < minComputeGroupMembersToStartCompute){
            //we have wait long enough, cannot wait any longer. we need to start anyway even the members of compute group yet not reach min requirement
            //what we need to do is to postpone
            console.log("We have reached maxBlockDelayRequiredBeforeComputeStart but still did not get enough compute group members. so we have to put the task CID back to the processedTxs again so that other nodes have the 2nd chance to try VRF")
            globalState.processedTxs.push({txType:'computeTask', cid:taskCid});
            break;
          }
          else{
            o('debug', 'we have waited enough time and the followUps number has reached the minimal requriement, so we can start now');
            globalState.pendingTasks[taskCid].type = 'computeTaskStart';
            break;
          }
        }
        
        break;
      }
      case 'computeTaskDone':{
        if ( await settleComputeTask(ipfs, globalState, taskCid)){
          delete globalState.escrowGasMap[taskCid];
          delete globalState.pendingTasks[taskCid];
        }
        console.log('case computeTaskDone, gasMap,', globalState.gasMap);
        break;
      }
    }//switch
    return ;
  });//map
  return ;
};

const settleNewNodeRa = (initiator, taskCid, globalState, allChildrenTasks)=>{
  let voteYes = [];
  let voteNo = [];
  let voteResultWeighted = 0;
  
  const newNodeUserName = initiator;
  allChildrenTasks.forEach(t=>{
    if(t.potResult){
      voteResultWeighted += t.proofOfVrf.j;
      voteYes.push(t.proofOfVrf.userName);
    }else{
      voteResultWeighted -= t.proofOfVrf.j;
      voteNo.push(t.proofOfVrf.userName);
    } 
  });
  //console.log('voteYes, voteNo, voteResultWeighted:', {voteYes, voteNo, voteResultWeighted});
  let winnerArray;
  let loserArray;

  if(voteResultWeighted > 0){
    winnerArray = voteYes;
    loserArray = voteNo;
  }else if(voteResultWeighted < 0){
    winnerArray = voteNo;
    loserArray = voteYes;
  }else{
    winnerArray = [];
    loserArray = [];
  }
  
  const totalAwardGas = globalState.escrowGasMap[taskCid];
  
  if (voteResultWeighted > 0) 
    globalState.creditMap[newNodeUserName] += initialCreditIssuedWhenPassRa;
  else
    globalState.creditMap[newNodeUserName] = 0;//reduceFactualIfRaFail;
  const rewardGasToEach = winnerArray.length? totalAwardGas / winnerArray.length : 0;
  winnerArray.forEach(u=>{
    globalState.creditMap[u] += awardCreditWhenRaSuccessful;
    //console.log('user u, add credit', {u, awardCreditWhenRaSuccessful});
    globalState.gasMap[u] += rewardGasToEach;
    //console.log('user u add gas:', {u, rewardGasToEach});

    log('ra_reward', {
      name : u,
      credit : awardCreditWhenRaSuccessful,
      credit_balance : globalState.creditMap[u],
      gas : rewardGasToEach,
      gas_balance : globalState.gasMap[u],
      cid : taskCid
    });
  });
  loserArray.forEach(u=>{
    globalState.creditMap[u] -= penaltyCreditWhenRaFail;
    //console.log('user u, lose gas:', {u, penaltyCreditWhenRaFail});

    log('ra_penalty', {
      name : u,
      credit : penaltyCreditWhenRaFail,
      credit_balance : globalState.creditMap[u],
      cid : taskCid
    });
  });
  
  delete globalState.escrowGasMap[taskCid];
  return true;
}
const runCreditNormalization = (creditMapInput, maxCredit)=>{
  let currentTotalCredit = Object.values(creditMapInput).reduce((accu, c)=>{
    if(!c) c = 0;
    return accu + c;
  }, 0);
  if(Math.abs((currentTotalCredit - maxCredit) / maxCredit ) < 0.01)
    return creditMapInput;
  const inflation = maxCredit - currentTotalCredit;
  const creditMap = {};
  Object.keys(creditMapInput).forEach(k=>{
    const newCredit = creditMapInput[k] * inflation / currentTotalCredit + creditMapInput[k]; //TODO: possible overflow
    creditMap[k] = Math.round(newCredit);
  });
  return creditMap;
};

const settleComputeTask = async (ipfs, globalState, taskCid)=>{
  console.log("gasMap before settleComputeTask,", globalState.gasMap);
  
  // const taskInPending = globalState.pendingTasks[taskCid];
  // const {followUps} = taskInPending;
  // const executor = chooseExecutorAndMonitors(taskInPending);
  // console.log('in settleComputeTask executor', executor)
  // let totalRewardGasRemaining = globalState.escrowGasMap[taskCid];
  // const taskObj = (await ipfs.dag.get(taskCid)).value;
  // const lambdaObj = (await ipfs.dag.get(taskObj.lambdaCid)).value;

  // const {ownerName, amt} = lambdaObj;
  // console.log('in settleComputeTask ownerName', ownerName);
  // console.log('in settleComputeTask amt', amt);
  // globalState.gasMap[ownerName] += amt;
  // totalRewardGasRemaining -= amt;
  // const rewardToExecutor = totalRewardGasRemaining / 2;
  // console.log('in settleComputeTask rewardToExecutor', rewardToExecutor)
  
  // globalState.gasMap[executor.userName] += rewardToExecutor;
  
  // totalRewardGasRemaining -= rewardToExecutor;

  // if(followUps.length == 1){
  //   //there is no monitor
  //   console.log("ERROR: We should always have followups as monitors");
  // }else{
  //   const rewardToEachMonitor = totalRewardGasRemaining / (followUps.length - 1);
  //   console.log('in settleComputeTask rewardToEachMonitor', rewardToEachMonitor)
  
  //   followUps.forEach((f)=>{
  //   const followUpUserName = f.userName;
  //   console.log('in settleComputeTask followUpUserName', followUpUserName);
  
  //   if(followUpUserName != executor.userName)
  //     globalState.gasMap[followUpUserName] += rewardToEachMonitor;

  //   })
  // }
  // console.log("gasMap after settleComputeTask,", globalState.gasMap);
  
  return true;
}
exports.runCreditNormalization = runCreditNormalization;