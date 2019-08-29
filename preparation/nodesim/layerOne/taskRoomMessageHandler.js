import {tryParseJson, minimalNewNodeJoinRaDeposit, expectNumberOfRemoteAttestatorsToBeVoted} from '../shared/constValue'
import {sha256} from 'js-sha256';
import { ecvrf, sortition} from 'vrf.js';
import Big from 'big.js';
import { o } from '../shared/utilities';
const log=()=>{};//Jacky, disable for now

export default (options)=>{
  return async (m)=>{
    const {globalState} = options;
    const messageString = m.data.toString();
    const messageObj = tryParseJson(messageString);
    //console.log("before process tx cid=", messageObj.cid,  " the globalState.processedTxs is,", globalState.processedTxs);
    if( typeof messageObj == "undefined") return false;
    const messageTypeHandlerMap = {
      gasTransfer:gasTransferProcess,
      newNodeJoinNeedRa: newNodeJoinNeedRaProcess,
      remoteAttestationDone: remoteAttestationDoneProcess,
      uploadLambda: updateLambda,
      computeTask: computeTask,
      computeTaskWinnerApplication: computeTaskWinnerApplication,
      computeTaskDone: undefined
    };

    const func = messageTypeHandlerMap[messageObj.txType];
    if(typeof func == 'function'){
      try{
        const newGlobalState = await func(options.globalState, messageObj.cid, m.from);
        if(! newGlobalState)
          throw "newGlobalState is null. It should be throw inside func, not here";
        newGlobalState.processedTxs.push(messageObj);
        if(newGlobalState)
          options.globalState = newGlobalState;
      }
      catch(e){
        o('error', "process task failed, tx is dropped, ", {cid:messageObj.cid, e});
      }
      
    }else{
      o('log', "taskRoom Unhandled message, ", messageObj);
    }
    
    
  }
};
const computeTaskWinnerApplication = async (ipfs, room, globalState, messageObj, from)=>{
  
  const {userName, taskCid} = messageObj;
  const taskObj = (await ipfs.dag.get(taskCid)).value;
  const {depositAmt} = taskObj;
  console.log('inside computeTaskWinnerApplication', {userName, depositAmt, taskCid, depositAmt});
  if (! takeEscrow(globalState, userName, depositAmt, taskCid))
    return false;
  
  globalState.pendingTasks[taskCid].followUps.push(messageObj);
  return true;
}

const gasTransferProcess = async (iputState, cid)=>{
  const globalState = Object.assign({}, iputState);
  if(!cid) return false;
  const tx = await global.ipfs.dag.get(cid)

  if(!tx){
    o('error', 'processing gasTransfer, tx cannot be retrieved from ipfs dag', cid);
    throw "processing gasTransfer, tx cannot be retrieved from ipfs dag";
  }

  const {fromUserName, toUserName, amt} = tx.value;
  if (amt < 0)  throw "gasTransfer amt need to > 0";
  if (!fromUserName || ! toUserName || !amt)  throw "fromUserName, toUserName, amt need to have value";
  if( globalState && globalState.gasMap && globalState.gasMap[fromUserName] && globalState.gasMap[fromUserName] > amt)
  {
    globalState.gasMap[fromUserName] -= amt;
    if(! globalState.gasMap[toUserName])  globalState.gasMap[toUserName] = amt;
    else globalState.gasMap[toUserName] += amt;

    log('gas_transfer', {
      from : fromUserName,
      to : toUserName,
      amt : amt,
      from_balance : globalState.gasMap[fromUserName],
      to_balance : globalState.gasMap[toUserName]
    });

    return globalState;
  }else{
    o('log', "gasTransferProcess error tx.value, globalState,", tx.value, globalState);
    throw "failed at globalState && globalState.gasMap && globalState.gasMap[fromUserName] && globalState.gasMap[fromUserName] > amt"
  };

}

const newNodeJoinNeedRaProcess = async (ipfs, room, globalState, cid)=>{
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



const remoteAttestationDoneProcess = async (ipfs, room, globalState, raDoneCid)=>{
  const tx = await ipfs.dag.get(raDoneCid);
  if(! tx || ! tx.value){
    console.log("in remoteAttestationDoneProcess, tx is not existing", tx);
    return false;
  }

  const {potResult,proofOfTrust,proofOfVrf} = tx.value;
  const {j, proof, value, taskCid, blockHeightWhenVRF, userName, publicKey} = proofOfVrf;
  const blockCid = globalState.blockHistory[blockHeightWhenVRF];
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
  const p = expectNumberOfRemoteAttestatorsToBeVoted / block.totalCreditForOnlineNodes;
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

