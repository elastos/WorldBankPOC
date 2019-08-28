import {minComputeGroupMembersToStartCompute, minBlockDelayRequiredBeforeComputeStart, maxBlockDelayRequiredBeforeComputeStart} from './constValue';



exports.eligibilityCheck = (currentBlockHeight, task)=>{
  const {startBlockHeight, initiator, followUps} = task;
  if(currentBlockHeight  - startBlockHeight < minBlockDelayRequiredBeforeComputeStart){
    console.log('we will need to wait more blocks until we can start computing. Let those slow nodes get more time responding the VRF');
    return null;
  }
  if((currentBlockHeight  - startBlockHeight) > maxBlockDelayRequiredBeforeComputeStart && followUps.length < minComputeGroupMembersToStartCompute){
    //we have wait long enough, cannot wait any longer. we need to start anyway even the members of compute group yet not reach min requirement
    //what we need to do is to postpone
    console.log("We have reached maxBlockDelayRequiredBeforeComputeStart but still did not get enough compute group members. so we have to put the task CID back to the processedTxs again so that other nodes have the 2nd chance to try VRF")
    return "needExtend";
  }
  if(followUps.length < minComputeGroupMembersToStartCompute){
    //we have not reached the minimal requirement of the number of compute groups (including executor and monitors). And, we can still wait a few blocks until we have to start anyway
    return null;  
  }
  //now it is time for those nodes who won the VRF to start. Server doesn't need to do anything.
  return "timeUp"
}

exports.executeCompute = async (options, taskCid, executor)=>{
  //this is just a place holder, in the real system, we should launch docker and run the command to get the result.
  //Now we just return hello world
  const task = (await options.ipfs.dag.get(taskCid)).value;
  console.log("I am executing task",task);
  
  const taskOwner = task.userName;
  
  const lambda = (await options.ipfs.dag.get(task.lambdaCid)).value;
  console.log("lambda is,", lambda);
  const lambdaOwner = lambda.ownerName;

  options.executeTaskParams = options.executeTaskParams || {};
  const taskOwnerPeerId = global.onlinePeerUserCache.getByUserName(taskOwner);
  const lambdaOwnerPeerId = global.onlinePeerUserCache.getByUserName(lambdaOwner);
  if(! taskOwnerPeerId || ! lambdaOwnerPeerId){
    console.log('either task owner or lambda owner is not online. computing cannot start. abort', {taskOwner, taskOwnerPeerId, lambdaOwner, lambdaOwnerPeerId});
    return "abort!";
  }
  const reqTaskParams = {
    type:'reqTaskParams',
    taskCid,
    executor,
    blockHeight:options.block.blockHeight
  };  

  const reqLambdaParams = {
    type:'reqLambdaParams',
    taskCid,
    executor,
    blockHeight:options.block.blockHeight
  };
  window.rooms.townHall.rpcRequest(taskOwnerPeerId, JSON.stringify(reqTaskParams), (res, err)=>{
    if(err){
      console.log(`I have got the task data from task owner but it is an error, `, err);
      return console.log(`I have got the task data from task owner but it is an error, `, err);
    }
    const {data, taskCid} = res;
    console.log('data, ', data);
    console.log(`I have got the task data from task owner, `, data);
    options.computeTaskBuffer = options.computeTaskBuffer || {};
    options.computeTaskBuffer[taskCid] = options.computeTaskBuffer[taskCid] || {};
    if(options.computeTaskBuffer[taskCid].data){
      console.log(`Error, executor has got the data already, why a new data come up again?`, {data, buffer: options.computeTaskBuffer});
      return;
    }

    options.computeTaskBuffer[taskCid].data = data;
    const result = executeIfParamsAreReady(options.computeTaskBuffer, taskCid);
    if(result){
      sendComputeTaskDone(options, taskCid);
    }
  });
  console.log(`Sending request for task data to taskOwner: ${taskOwner}  PeerId:${taskOwnerPeerId}`, reqTaskParams)
  window.rooms.townHall.rpcRequest(lambdaOwnerPeerId, JSON.stringify(reqLambdaParams), (res, err)=>{
    if(err){
      console.log(`I have got the task lambda from task owner but it is an error, `, err);
      return console.log(`I have got the task lambda from task owner but it is an error, `, err);
    }
    const {code, taskCid} = res;
    console.log('code, ', code);
    console.log(`I have got the lambda code from lambda owner, `, code);
    options.computeTaskBuffer = options.computeTaskBuffer || {};
    options.computeTaskBuffer[taskCid] = options.computeTaskBuffer[taskCid] || {};
    if(options.computeTaskBuffer[taskCid].code){
      console.log(`Error, executor has got the code already, why a new code come up again?`, {code, buffer: options.computeTaskBuffer});
      return
    }

    options.computeTaskBuffer[taskCid].code = code;
    const result = executeIfParamsAreReady(options.computeTaskBuffer, taskCid);
    if(result){
      sendComputeTaskDone(options, taskCid);
    }
    return
  });
  console.log(`Sending request for lambda function code to lambda Owner: ${lambdaOwner} PeerId:${lambdaOwnerPeerId}`, reqLambdaParams);
  return;
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
  window.rooms.taskRoom.broadcast(JSON.stringify(computeTaskDoneObj));

}
const chooseExecutorAndMonitors = (task)=>{
  let executor;
  let maxJ = 0;
  for(var i =0; i < task.followUps.length; i ++){
    if ( parseInt(task.followUps[i].j) > maxJ){ //first come first server. If there are more than one member has the same highest J, the first is the winner. based on the block record
      executor = task.followUps[i];
      maxJ = parseInt(task.followUps[i].j);
    }
  }
  return executor;
}
exports.chooseExecutorAndMonitors = chooseExecutorAndMonitors;

const executeComputeUsingEval = ({code, data})=>{
  const args = data;
  return eval(code);
}
exports.executeComputeUsingEval = executeComputeUsingEval;

