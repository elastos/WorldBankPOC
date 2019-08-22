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

exports.executeCompute = async (options, taskCid, task, executor, executorJ)=>{
  const taskObj = (await options.ipfs.dag.get(taskCid)).value;
  //this is just a place holder, in the real system, we should launch docker and run the command to get the result.
  //Now we just return hello world
  return "Hello World!";
}

exports.chooseExecutorAndMonitors = async (executeTask)=>{
  const {followUps} = executeTask;
  
}