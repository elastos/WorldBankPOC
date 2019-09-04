import {minComputeGroupMembersToStartCompute, minBlockDelayRequiredBeforeComputeStart, maxBlockDelayRequiredBeforeComputeStart} from './constValue';
import { o } from './utilities';


exports.eligibilityCheck = (currentBlockHeight, task)=>{



  return true
}

exports.executeCompute = async (taskCid, task, executor)=>{
  //this is just a place holder, in the real system, we should launch docker and run the command to get the result.
  //Now we just return hello world
  const computeTaskBuffer = {};//We use this buffer to store the params data from task owner, and code from lambda owner. then run execute task
  
  console.log("I am executing task",task);
  const {initiatorPeerId, lambdaOwnerPeerId} = task;
  
  if(! initiatorPeerId || ! lambdaOwnerPeerId){
   throw 'either task owner or lambda owner is not online. computing cannot start. abort' + JSON.stringify({taskOwner, taskOwnerPeerId, lambdaOwner, lambdaOwnerPeerId});
  }
  const reqTaskParams = {
    type:'reqTaskParams',
    taskCid,
    executor,
    blockHeight:block.blockHeight
  };  

  const reqLambdaParams = {
    type:'reqLambdaParams',
    taskCid,
    executor,
    blockHeight:block.blockHeight
  };
  const reqTaskParamsResponseHandler = (res, err)=>{
    if(err){
      throw `I have got the task data from task owner but it is an error, ` +  err;
      
    }
    o('log', 'receiving response from task owner for task params:' + res);
    
    const {data, taskCid} = res;
    console.log('data, ', data);
    console.log(`I have got the task data from task owner, `, data);
    
    computeTaskBuffer[taskCid] = computeTaskBuffer[taskCid] || {};
    if(computeTaskBuffer[taskCid].data){
      throw `Error, executor has got the data already, why a new data come up again?`+  JSON.stringify({data, buffer: options.computeTaskBuffer});
      
    }

    computeTaskBuffer[taskCid].data = data;
    const result = executeIfParamsAreReady(options.computeTaskBuffer, taskCid);
    if(result){
      sendComputeTaskDone(options, taskCid);
    }
  };

  global.rpcEvent.emit('rpcRequest', {
    sendToPeerId: taskOwnerPeerId,
    message: JSON.stringify(reqTaskParams),
    responseCallBack: reqTaskParamsResponseHandler
  });
  
   
  console.log(`Sending request for task data to taskOwner: ${taskOwner}  PeerId:${taskOwnerPeerId}`, reqTaskParams)
  
  const reqLambdaParamsHandler = (res, err)=>{
    if(err){
      throw `I have got the task lambda from task owner but it is an error, ` +  err;
      
    }
    o('log', 'receiving response from lambda owner for code:' + res);
    const {code, taskCid} = res;
    console.log('code, ', code);
    console.log(`I have got the lambda code from lambda owner, `, code);
    computeTaskBuffer = computeTaskBuffer || {};
    computeTaskBuffer[taskCid] = computeTaskBuffer[taskCid] || {};
    if(computeTaskBuffer[taskCid].code){
      throw `Error, executor has got the code already, why a new code come up again?` +  JSON.stringify({code, buffer: options.computeTaskBuffer});
      
    }

    computeTaskBuffer[taskCid].code = code;
    const result = executeIfParamsAreReady(computeTaskBuffer, taskCid);
    if(result){
      sendComputeTaskDone(options, taskCid);
    }
  };

  global.rpcEvent.on('rpcRequest', {
    sendToPeerId: lambdaOwnerPeerId,
    message: JSON.stringify(reqLambdaParams),
    responseCallBack: reqLambdaParamsHandler
  });
  console.log(`Sending request for lambda function code to lambda Owner: ${lambdaOwner} PeerId:${lambdaOwnerPeerId}`, reqLambdaParams);
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

const sendComputeTaskDone = (options, taskCid)=>{
  const {userInfo} = options;
  const computeTaskDoneObj = {
    txType:'computeTaskDone',
    userName: userInfo.userName,
    taskCid
    
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

