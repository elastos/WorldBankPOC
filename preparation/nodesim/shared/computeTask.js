import {minComputeGroupMembersToStartCompute, minBlockDelayRequiredBeforeComputeStart, maxBlockDelayRequiredBeforeComputeStart} from './constValue';
import { o } from './utilities';


exports.eligibilityCheck = (currentBlockHeight, task)=>{



  return true
}

exports.executeCompute = async (taskCid)=>{
  //this is just a place holder, in the real system, we should launch docker and run the command to get the result.
  //Now we just return hello world
  const computeTaskBuffer = {};//We use this buffer to store the params data from task owner, and code from lambda owner. then run execute task
  
  const taskOwnerPeerId = global.nodeSimCache.computeTaskPeersMgr.getTaskOwnerPeer(taskCid);
  const lambdaOwnerPeerId = global.nodeSimCache.computeTaskPeersMgr.getLambdaOwnerPeer(taskCid);

  if(! taskOwnerPeerId || ! lambdaOwnerPeerId){
   throw 'either task owner or lambda owner is not online. computing cannot start. abort' + JSON.stringify({ taskOwnerPeerId, lambdaOwnerPeerId});
  }
  const reqTaskParams = {
    type:'reqTaskParams',
    taskCid,
    blockHeight:global.blockMgr.getLatestBlockHeight()
  };  

  const reqLambdaParams = {
    type:'reqLambdaParams',
    taskCid,
    blockHeight:global.blockMgr.getLatestBlockHeight()
  };
  const reqTaskParamsResponseHandler = (res, err)=>{
    if(err){
      o('error', `I have got the task data from task owner but it is an error, ` +  err);
      return;
    }
    o('log', 'receiving response from task owner for task params:' + res);
    
    const {data, taskCid} = res;
    console.log('data, ', data);
    console.log(`I have got the task data from task owner, `, data);
    
    computeTaskBuffer[taskCid] = computeTaskBuffer[taskCid] || {};
    if(computeTaskBuffer[taskCid].data){
      throw `Error, executor has got the data already, why a new data come up again?`+  JSON.stringify({data, buffer: computeTaskBuffer});
      
    }

    computeTaskBuffer[taskCid].data = data;
    const result = executeIfParamsAreReady(computeTaskBuffer, taskCid);
    if(result){
      sendComputeResultBackToTaskOwner(taskCid, result);
      sendComputeExecutionDoneToMonitor(taskCid);
      sendComputeTaskExecutionDone(taskCid);
    }
  };

  global.rpcEvent.emit('rpcRequest', {
    sendToPeerId: taskOwnerPeerId,
    message: JSON.stringify(reqTaskParams),
    responseCallBack: reqTaskParamsResponseHandler
  });
  
   
  console.log(`Sending request for task data to taskOwner: PeerId:${taskOwnerPeerId}`, reqTaskParams)
  
  const reqLambdaParamsHandler = (res, err)=>{
    if(err){
      o('error',  `I have got the task lambda from task owner but it is an error, ` +  err);
      return;
    }
    o('log', 'receiving response from lambda owner for code:' + res);
    const {code, taskCid} = res;
    console.log('code, ', code);
    console.log(`I have got the lambda code from lambda owner, `, code);
    computeTaskBuffer[taskCid] = computeTaskBuffer[taskCid] || {};
    
    if(computeTaskBuffer[taskCid].code){
      throw `Error, executor has got the code already, why a new code come up again?` +  JSON.stringify({code, buffer: computeTaskBuffer});
      
    }

    computeTaskBuffer[taskCid].code = code;
    console.log('computeTaskBuffer', computeTaskBuffer);
    const result = executeIfParamsAreReady(computeTaskBuffer, taskCid);
    if(result){
      sendComputeResultBackToTaskOwner(taskCid, result);
      sendComputeExecutionDoneToMonitor(taskCid);
      sendComputeTaskExecutionDone(taskCid);
    }
  };

  global.rpcEvent.emit('rpcRequest', {
    sendToPeerId: lambdaOwnerPeerId,
    message: JSON.stringify(reqLambdaParams),
    responseCallBack: reqLambdaParamsHandler
  });
  console.log(`Sending request for lambda function code to lambda Owner PeerId:${lambdaOwnerPeerId}`, reqLambdaParams);
}

const executeIfParamsAreReady = (computeTaskBuffer, taskCid)=>{
  if(computeTaskBuffer[taskCid].code && computeTaskBuffer[taskCid].data){
    console.log(`Executor has got both data and code, it can start execution`, computeTaskBuffer[taskCid])
    const result = executeComputeUsingEval(computeTaskBuffer[taskCid]);
    delete computeTaskBuffer[taskCid];
    console.log( `Execution result:`, result);
    return result;
  }
  return null;
}

const sendComputeResultBackToTaskOwner = (taskCid, result)=>{
  const taskOwnerPeerId = global.nodeSimCache.computeTaskPeersMgr.getTaskOwnerPeer(taskCid);
  const reqComputeCompleted = {
    type: 'reqComputeCompleted',
    taskCid,
    result
  };
  const reqComputeCompletedCallBack = (res, err)=>{
    if(err){
      o('error', 'reqComputeCompleted get error response from taskOwner. err:', err);
    }
    if(res){
      o('debug', 'I am executor. I have completed the compute task. i got this result from task owner:', res);
    }
  };
  global.rpcEvent.emit('rpcRequest', {
    sendToPeerId: taskOwnerPeerId,
    message:JSON.stringify(reqComputeCompleted),
    responseCallBack: reqComputeCompletedCallBack
  })
  o('debug', `I have done the task execution. i send reqComputeComplete to the task owner peer:${taskOwnerPeerId}, waiting for response.`);
};

const sendComputeExecutionDoneToMonitor = (taskCid)=>{
  const monitorsPeers = global.nodeSimCache.computeTaskPeersMgr.getPeersInGroup(taskCid);
  o('debug', 'monitorsPeers is,', monitorsPeers);
  const reqComputeCompleted = {
    type: 'reqComputeCompleted',
    taskCid
  };
  const reqComputeCompletedFromMonitorCallBack = (res, err)=>{
    if(err){
      o('error', 'reqComputeCompleted get error response from remote attestator. err:', err);
    }
    if(res){
      o('debug', 'I am executor. I have completed the compute task. i got this result from my remote attestator:', res);
    }
  };
  for(let sendToPeerId of monitorsPeers){
    global.rpcEvent.emit('rpcRequest', {
      sendToPeerId,
      message:JSON.stringify(reqComputeCompleted),
      responseCallBack: reqComputeCompletedFromMonitorCallBack
    });
     o('debug', `I have done the task execution. i send reqComputeComplete to my monitor peer:${sendToPeerId}, waiting for response.`);
  };
  
};
exports.sendComputeTaskRaDone = (taskCid, result=true)=>{
  const computeTaskRaDoneObj = {
    txType:'computeTaskRaDone',
    monitorName: global.userInfo.userName,
    executorName: global.nodeSimCache.computeTaskPeersMgr.getExecutorName(taskCid),
    taskCid,
    myVrfProof,
    result
  }
  global.broadcastEvent.emit('taskRoom', JSON.stringify(computeTaskRaDoneObj));
  o('log', 'computer ra task done. send out broadcast in taskRoom');
}

exports.computeTaskOwnerConfirmationDone = (taskCid, result = true)=>{
  const computeTaskOwnerConfirmationDoneObj = {
    txType:'computeTaskExecutionDone',
    taskOwnerName: global.userInfo.userName,
    executorName: global.nodeSimCache.computeTaskPeersMgr.getExecutorName(taskCid),
    taskCid,
    result
  }
  global.broadcastEvent.emit('taskRoom', JSON.stringify(computeTaskOwnerConfirmationDoneObj));
  o('log', 'computer computeTaskOwnerConfirmationDone. send out broadcast in taskRoom');
}


const sendComputeTaskExecutionDone = (taskCid)=>{


  const computeTaskDoneObj = {
    txType:'computeTaskExecutionDone',
    executorName: global.userInfo.userName,
    taskCid,
    myVrfProof:global.nodeSimCache.computeTaskPeersMgr.getMyVrfProofInfo(taskCid),
    
  }
  global.broadcastEvent.emit('taskRoom', JSON.stringify(computeTaskDoneObj));
  o('log', 'computer task done. send out broadcast in taskRoom');
}
// const chooseExecutorAndMonitors = (task)=>{
//   let executor;
//   let maxJ = 0;
//   for(var i =0; i < task.followUps.length; i ++){
//     if ( parseInt(task.followUps[i].j) > maxJ){ //first come first server. If there are more than one member has the same highest J, the first is the winner. based on the block record
//       executor = task.followUps[i];
//       maxJ = parseInt(task.followUps[i].j);
//     }
//   }
//   return executor;
// }
// exports.chooseExecutorAndMonitors = chooseExecutorAndMonitors;

const executeComputeUsingEval = ({code, data})=>{
  const args = data;
  return eval(code);
}
exports.executeComputeUsingEval = executeComputeUsingEval;

