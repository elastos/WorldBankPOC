import {o, tryParseJson} from '../shared/utilities';
import {eligibilityCheck, executeCompute} from '../shared/computeTask';
import diff from 'hyperdiff';
import {validateVrf} from '../shared/remoteAttestation';

exports.handlePendingTxs = async ({height})=>{
  const block = await global.blockMgr.getBlockByHeight(height);
  const computeTaskCids = Object.keys(block.pendingTasks).filter((k)=>block.pendingTasks[k].type == 'computeTask');
  computeTaskCids.forEach(handlePendingComputeTask(block));
}

const handlePendingComputeTask = (block)=> async ( c)=>{
  if ( global.nodeSimCache.computeTasks[c]){
    /*********
     * based on the exists of global.nodeSimCache.computeTasks. I know I am one of the execution group.
     * So I will check other peers verify their VRF and figure out who is the executor. 
     */
    o('debug', 'I am in the taskCid:${c} execution group. I need to check other peers VRF making sure no hacker invovled')
    o('debug', 'global.nodeSimCache.computeTasks[c]', global.nodeSimCache.computeTasks[c]);
    const task = block.pendingTasks[c];
    verifyVrfToNewAddedPeersJoinIfPassed(block, c, task);

    if(eligibilityCheck(block.blockHeight, task) == 'timeUp'){
      const executor = global.nodeSimCache.computeTasks[c].executor;
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
  }
  else{
    /***
     * I am not lucky to win the VRF at all. I won't be involved in the execution group.
     *  so I am not interested in the VRF verify at all. Just do nothing
     */
    o('debug', 'I am not in execution group. do not bother checking other peer VRF');
  }
}

const verifyVrfToNewAddedPeersJoinIfPassed = async (block, c, task)=>{
  global.nodeSimCache.computeTasks[c].groupPeers = global.nodeSimCache.computeTasks[c].groupPeers || {};
  const existingPeersInGroup = Object.keys(global.nodeSimCache.computeTasks[c].groupPeers);
  const peersInBlockPending = Object.keys(task. followUps);
  const differences = diff(existingPeersInGroup, peersInBlockPending);
  /***
   * In most cases, only peer added.
   * so we need to add those new peer Ids to the group. Before doing that, we need to ask their VRF information.
   * Why do not we put the VRF information i the block. There are two reasons
   * 1. minimize the size of block
   * 2. release as less information as possible to the public
   * 
   * Only those who have paid escrow and get involved in and know who is executor.
   * If some hacker really wants to know, he need to pay some cost first.
   * and if the hacker did not win the VRF and just pay deposit trying to peek who is winner the result will be
   * 1. he lost his deposit (maybe a small money)
   * 2. when other node detect someone paid escrow but cannot provide his VRF proof. he will stop the tasks, because eventually
   * the layerOne will drop this task and no one get paid.
   * then the hacker won't get what he want to get (such as DDoS to the exeuctor , or collude with monitor etc)
   */
  differences.added.forEach(async addedPeer=>{
    global.rpcEvent.emit('rpcRequest', {
      sendToPeerId:addedPeer, 
      message:JSON.stringify({
        type:'verifyPeerVrfForComputeTasks',
        taskCid: c,
        blockHeight: block.height
      }), 
      responseCallBack:handleRaResponse
    }
    );

    const handleRaResponse = async(res, err)=>{
      if(err){
        o('error', `Asking another peer for computeTask VRF verficiation information. I got an no or error response, 
          I will not add him into my computeTask execution group. err is ${err}`)
        return;//early
      }
      else{
        o('debug', `I have got another peer response on compute task VRF information ${res}`);
        const proofFromNewAddedPeer = tryParseJson(res);
        if(! proofFromNewAddedPeer){
          o('error', `the res from "verifyPeerVrfForComputeTasks" cannot be parsed back to JSON. 
            I cannot add this new added peer to my execution team`);
          return;//early
        }
        const {j, proof, value, blockCid, taskCid, publicKey, userName} = proofFromNewAddedPeer;
        if(global.blockMgr.getBlockCidByHeight(block.height) != blockCid){
          return o('error', `The added peer provide a computeTask VRF with blockCid ${blockCid} is different than the 
            block cid from layer One. 
            This block cid is the height ${block.height} when pendingTasks are added`);
        }
        if(taskCid != c){
          return o('error', `The added peer provide a computeTask VRF with blockCid ${blockCid} is 
            different than the block cid from layer One. This block cid is the height ${block.height} 
            when pendingTasks are added`);
        }
        if(j <= 0){
          return o('error', `The added peer doesnot have the right to join execution group. His J value is ${j}`);
        }
        const verifyResult = await validateVrf({ipfs: global.ipfs, j, proof, value, blockCid, taskCid, publicKey, userName});
        if(verifyResult.result == false){
          o('log', `Another peer ID:${addedPeer} is trying to join our execution group, but his VRF 
            verification failed. ValidateVrf returns with error ${verifyResult.reason}`);
          return;//early
        }

        global.nodeSimCache.computeTasks[c].groupPeers[addedPeer] = {j, value, userName, publicKey};

        /*****
         * 
         * compare existing groupPeers's exeuctor. We always trying to keep the exeuctor has the hightest J and lowest random value
         * If any new added peer has a higher J value, and lower random vlaue, he will be the executor.
         * We compure both J and value. 
         * If J is higher, he is new executor, if J is the same, then compare the random value.  If the new added
         * peer has lower random value, he is new executor
         */
        if (! global.nodeSimCache.computeTasks[c].groupPeers.executorPeerId){
          global.nodeSimCache.computeTasks[c].groupPeers.executorPeerId = addedPeer
        }
        else{
          const currentExecutorPeerId = global.nodeSimCache.computeTasks[c].groupPeers.executorPeerId;
          const currentExecutor = global.nodeSimCache.computeTasks[c].groupPeers[currentExecutorPeerId];
          if(currentExecutor.j < j){
            global.nodeSimCache.computeTasks[c].groupPeers.executorPeerId = addedPeer;
          }
          else if(currentExecutor.j == j){
            if(currentExecutor.value > value){
              global.nodeSimCache.computeTasks[c].groupPeers.executorPeerId = addedPeer;
            }
          }
        }
      }
      /*******
       * Ref to the code above
       * Now we have got the global.nodeSimCache.computeTasks[c].groupPeers.executorPeerId to be highest J and lowest random value
       * If every node run the same algorithm, they will have the same executor.
       * Anyone who cannot get the same executor, their final reward application will be rejected by layerone, so he won't get reward and wate time and escrow money
       */


    }
    
  });


  
  differences.removed.forEach(removedPeer=>{
    /****
   * 
   * for code below
   * 
   * I do not know why the peer will be removed. but just in case
   */
    o('error', `I do not know in what situation a peer would be added into global.nodeSimCache.computeTasks[c].groupPeers
      then removed in future blocks. Just in case`)
    delete global.nodeSimCache.computeTasks[c].groupPeers[removedPeer];
  })


}


exports.handlePendingComputeTask = handlePendingComputeTask;