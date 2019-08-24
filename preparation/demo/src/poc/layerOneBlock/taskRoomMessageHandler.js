import {tryParseJson, minimalNewNodeJoinRaDeposit, expectNumberOfRemoteAttestatorsToBeVoted} from '../constValue'
import {sha256} from 'js-sha256';
import { ecvrf, sortition} from 'vrf.js';
import Big from 'big.js';

import {log} from '../PotLog';

export default (ipfs, room, options)=>{
  return async (m)=>{
    const {globalState} = options;
    const messageString = m.data.toString();
    
    const messageObj = tryParseJson(messageString);
    //console.log("before process tx cid=", messageObj.cid,  " the globalState.processedTxs is,", globalState.processedTxs);
    if( typeof messageObj == "undefined") return false;
    let processResult;
    switch(messageObj.txType){
      case "gasTransfer":
        processResult = await gasTransferProcess(ipfs, room, options, messageObj.cid);
        break;
      case "newNodeJoinNeedRa":
        processResult = await newNodeJoinNeedRaProcess(ipfs, room, options, messageObj.cid);
        break;
      case "remoteAttestationDone":
        processResult = await remoteAttestationDoneProcess(ipfs, room, options, messageObj.cid, m.from);
        break;
      case 'uploadLambda':{
        processResult = await updateLambda(ipfs, room, options, messageObj.cid, m.from);
        
        break;
      }
      case 'computeTask':{
        processResult = await computeTask(ipfs, room, options, messageObj.cid, m.from);
        
        break;
      }
      case "computeTaskWinnerApplication":
          //console.log('layerOne townhall, record the highest J value.', messageObj);
    //       "type": "computeTaskWinnerApplication",
    // "ipfsPeerId": "QmcRcLKdqpydWjKYxgDGSUZ5Qyh4NqNxikLFG3KJ6yLQoj",
    // "userName": "user #16",
    // "publicKey": "bae714c4e682fa0d36dd11fd73a3113817ec521df3f337757f78ad7392f061d9",
    // "taskCid": "bafyreihjakj2lrb5blk7jsve4kookxhjvwiawfc2aaptogoskfahbvehie",
    // "proof": "025eb4b325b16db6969967eb58081272d8ca3d4f986ea5efdf29180de0a86cca733763a4a1814b9b975b0bf1e25faede8665d3d95598ba55b7b10680b23801fdd367943070e67f96729957ba4348339ec2",
    // "value": "5eb4b325b16db6969967eb58081272d8ca3d4f986ea5efdf29180de0a86cca73",
    // "j": "1",
    // "blockHeightWhenVRF": 2
        processResult = await computeTaskWinnerApplication(ipfs, room, options, messageObj, m.from);//
        break;
      case 'computeTaskDone':{
        processResult = true;
        break;
      }
      default:
        console.log("taskRoom Unhandled message, ", messageObj);
    }
    if(processResult){
      globalState.processedTxs.push(messageObj);
      //console.log("after process tx cid=", messageObj.cid,  " the globalState.processedTxs is,", globalState.processedTxs);
    }
    else{
      console.log("process task failed, tx is dropped, ", messageObj.cid);
    }
  }
};
const computeTaskWinnerApplication = async (ipfs, room, options, messageObj, from)=>{
  
  const {globalState} = options;
  const {userName, taskCid} = messageObj;
  const taskObj = (await ipfs.dag.get(taskCid)).value;
  const {depositAmt} = taskObj;
  console.log('inside computeTaskWinnerApplication', {userName, depositAmt, taskCid, depositAmt});
  if (! takeEscrow(globalState, userName, depositAmt, taskCid))
    return false;
  
  globalState.pendingTasks[taskCid].followUps.push(messageObj);
  return true;
}

const gasTransferProcess = async (ipfs, room, options, cid)=>{
  const {globalState} = options;
  if(!cid) return false;
  const tx = await ipfs.dag.get(cid)

  if(!tx) return false;

  const {fromPeerId, toPeerId, amt} = tx.value;
  if (amt < 0)  return false;
  if (!fromPeerId || ! toPeerId || !amt)  return false;
  if( globalState && globalState.gasMap && globalState.gasMap[fromPeerId] && globalState.gasMap[fromPeerId] > amt)
  {
    globalState.gasMap[fromPeerId] -= amt;
    if(! globalState.gasMap[toPeerId])  globalState.gasMap[toPeerId] = amt;
    else globalState.gasMap[toPeerId] += amt;

    log('gas_transfer', {
      from : fromPeerId,
      to : toPeerId,
      amt : amt,
      from_balance : globalState.gasMap[fromPeerId],
      to_balance : globalState.gasMap[toPeerId]
    });

    return true;
  }else{
    console.log("gasTransferProcess error tx.value, globalState,", tx.value, globalState);
    return false;
  };

}

const newNodeJoinNeedRaProcess = async (ipfs, room, options, cid)=>{
  const {globalState} = options;
  if(!cid) {
    console.log("in newNodeJoinNeedRaProcess, cid is not existing,", cid);
    return false
  };
  const tx = await ipfs.dag.get(cid)

  if(!tx){ 
    console.log("in newNodeJoinNeedRaProcess, tx is not existing", tx);
    return false;
  }

  const {userName, depositAmt} = tx.value;
  if (!userName)  return false;
  if (depositAmt < minimalNewNodeJoinRaDeposit){
    console.log("Please pay more deposit to get your new node verified. Minimal is,", minimalNewNodeJoinRaDeposit);
    return false;
  }
  if (! takeEscrow(globalState, userName, depositAmt, cid))
    return false;
  if (!globalState.pendingTasks[cid]) globalState.pendingTasks[cid] = {
    type: 'newNodeJoinNeedRa',
    initiator: userName,
    startBlockHeight: globalState.blockHeight + 1,
    followUps:  []
  };

  log('new_ra', {
    name : userName,
    amt : depositAmt,
    cid : cid
  });
  return true;
}



const remoteAttestationDoneProcess = async (ipfs, room, options, raDoneCid)=>{
  const tx = await ipfs.dag.get(raDoneCid);
  if(! tx || ! tx.value){
    console.log("in remoteAttestationDoneProcess, tx is not existing", tx);
    return false;
  }

  const {potResult,proofOfTrust,proofOfVrf} = tx.value;
  const {j, proof, value, taskCid, blockHeightWhenVRF, userName, publicKey} = proofOfVrf;
  const blockCid = options.globalState.blockHistory[blockHeightWhenVRF];
  const {globalState} = options;
  const task = await ipfs.dag.get(taskCid);
  //console.log('task,', task);
  const {depositAmt} = task.value;
  if (! takeEscrow(globalState, userName, depositAmt, taskCid)){
    return false;
  }
  const vrfMsg = sha256.update(blockCid).update(taskCid).hex();
  
  const vrfVerifyResult = ecvrf.verify(Buffer.from(publicKey, 'hex'), Buffer.from(vrfMsg, 'hex'), Buffer.from(proof, 'hex'), Buffer.from(value, 'hex'));
  if(! vrfVerifyResult){
    const reason = 'VRF verify failed';
    console.log('remoteAttestationDoneProcess fail, ', reason);

    log('ra_done', {
      name : userName,
      vrf : false,
      cid : taskCid,
      reason
    })
    return false;
  }
  const block = (await ipfs.dag.get(blockCid)).value;
  const totalCreditForOnlineNodes = block.totalCreditForOnlineNodes;
  const p = expectNumberOfRemoteAttestatorsToBeVoted / totalCreditForOnlineNodes;
  const remoteAttestatorCreditBalance = block.creditMap[userName];
  const jVerify = sortition.getVotes(Buffer.from(value, 'hex'), new Big(remoteAttestatorCreditBalance), new Big(p));
  if(jVerify.toFixed() != j){
    console.log("vrf soritition failed,", jVerify.toFixed());
    return false;
  }
  if (!globalState.pendingTasks[taskCid]) {
    console.log("This could caused by a late response RA done message. Because when this message received, the RA done has been processed and removed. We have to drop this RA done because it is too late");
    return false;
  };
  globalState.pendingTasks[taskCid].followUps.push(raDoneCid);

  log('ra_done', {
    vrf : true,
    name : userName,
    cid : taskCid,
  })
  return true;
};

const takeEscrow = (globalState, userName, depositAmt, taskCid)=>{
  if( globalState && globalState.gasMap && globalState.gasMap[userName] && globalState.gasMap[userName] > depositAmt)
  {
    globalState.gasMap[userName] -= depositAmt;
    if (! globalState.escrowGasMap) globalState.escrowGasMap = {};
    if (! globalState.escrowGasMap[taskCid])  globalState.escrowGasMap[taskCid] = depositAmt;
    else globalState.escrowGasMap[taskCid] += depositAmt;
    
    return true;
  }else{
    console.log("takeEscrow error ,", {userName, depositAmt, taskCid});
    return false;
  };
};

const updateLambda = async (ipfs, room, options, cid)=>{
  const tx = await ipfs.dag.get(cid);
  if(! tx || ! tx.value){
    console.log("in updateLambda, tx is not existing", tx);
    return false;
  }

  if(tx.value.amt < 0) return false;
  return true;
}

const computeTask = async (ipfs, room, options, cid, from)=>{
  const {globalState} = options;
  const tx = await ipfs.dag.get(cid);
  if(! tx || ! tx.value){
    console.log("in computeTask, tx is not existing", tx);
    return false;
  }
  const {userName, depositAmt} = tx.value;
  if (!userName)  return false;
  

  if (! globalState.escrowGasMap[cid] && ! takeEscrow(globalState, userName, depositAmt, cid)) //we should not double desposit for a delayed task due to unlucky vRF from other nodes.
    return false;
    


  if (!globalState.pendingTasks[cid]) globalState.pendingTasks[cid] = {
    type: 'computeTask',
    initiator: userName,
    startBlockHeight: globalState.blockHeight + 1,
    followUps:  []
  };
  

  return true;
}

