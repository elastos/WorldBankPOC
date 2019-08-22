import {minComputeGroupMembersToStartCompute, minBlockDelayRequiredBeforeComputeStart, maxBlockDelayRequiredBeforeComputeStart} from './constValue';
import { logToWebPage } from './simulatorSrc/utils';

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
  const taskOwnerPeerId = Object.keys(options.block.trustedPeerToUserInfo).find((k)=>options.block.trustedPeerToUserInfo[k].userName == taskOwner);
  const lambdaOwnerPeerId = Object.keys(options.block.trustedPeerToUserInfo).find((k)=>options.block.trustedPeerToUserInfo[k].userName == lambdaOwner);
  if(! taskOwnerPeerId || ! lambdaOwnerPeerId){
    logToWebPage('either task owner or lambda owner is not online. computing cannot start. abort', {taskOwner, taskOwnerPeerId, lambdaOwner, lambdaOwnerPeerId, userList:options.block.trustedPeerToUserInfo, });
    return "abort!";
  }
  const reqTaskParams = {
    type:'reqTaskParams',
    taskCid,
    executor
  };  

  const reqLambdaParams = {
    type:'reqLambdaParams',
    taskCid,
    executor
  };
  window.rooms.townHall.sendTo(taskOwnerPeerId, JSON.stringify(reqTaskParams));
  logToWebPage(`Sending request for task data to taskOwner: ${taskOwner}  PeerId:${taskOwnerPeerId}`, reqTaskParams)
  window.rooms.townHall.sendTo(lambdaOwnerPeerId, JSON.stringify(reqLambdaParams));
  logToWebPage(`Sending request for lambda function code to lambda Owner: ${lambdaOwner} PeerId:${lambdaOwnerPeerId}`, reqLambdaParams);
  return "Hello World!";
}

exports.chooseExecutorAndMonitors = (task)=>{
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

exports.executeComputeUsingEval = ({code, data})=>{
  const args = data;
  return eval(code);
}

