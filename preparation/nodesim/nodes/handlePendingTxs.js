import {o} from '../shared/utilities';
import {eligibilityCheck, executeCompute, chooseExecutorAndMonitors} from '../shared/computeTask';

exports.handlePendingTxs = async ({height})=>{
  const block = await global.blockMgr.getBlockByHeight(height);
  
  const computeTaskCids = Object.keys(block.pendingTasks).filter((k)=>block.pendingTasks[k].type == 'computeTask');
  computeTaskCids.forEach(async c=>{
    const task = block.pendingTasks[c];
    if(eligibilityCheck(block.blockHeight, task) == 'timeUp'){
      const executor = chooseExecutorAndMonitors(task);
      console.log("executor is,", executor.userName);
      if(global.userInfo.userName == executor.userName){
        o('log', "I am the executor. I am going to run taskCid:", c);
        try{executeCompute(c, task, executor);}
        catch(e){
          o('error', "executeCompute error", e);
        }
      }else{
        o('log', `I am the monitor, the executor is ${executor.userName}`);
      }
    }
  })

}
