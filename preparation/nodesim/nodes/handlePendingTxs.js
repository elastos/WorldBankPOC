import {o, tryParseJson} from '../shared/utilities';
import {eligibilityCheck, executeCompute} from '../shared/computeTask';
import diff from 'hyperdiff';
import {validateRemoteAttestationVrf} from '../shared/remoteAttestation';
import {ComputeTaskRoles} from '../shared/constValue';

exports.handlePendingTxs = async ({height})=>{
  const block = await global.blockMgr.getBlockByHeight(height);
  const computeTaskCids = Object.keys(block.pendingTasks).filter((k)=>block.pendingTasks[k].type == 'computeTask');
  computeTaskCids.forEach(handlePendingComputeTask(block));

  const computeTaskStartCids = Object.keys(block.pendingTasks).filter((k)=>block.pendingTasks[k].type == 'computeTaskStart');
  computeTaskStartCids.forEach(handlePendingComputeTaskStart(block));
}

const handlePendingComputeTask = (block)=>( taskCid)=>{
  if(typeof global.nodeSimCache.computeTaskPeersMgr.checkMyRoleInTask(taskCid) == 'undefined'){
    
    /***
    * I am not lucky to win the VRF at all. I won't be involved in the execution group.
    *  so I am not interested in the VRF verify at all. Just do nothing
    */
    global.nodeSimCache.computeTaskPeersMgr.debugOutput(taskCid);
    return o('debug', 'HandlePendingComputeTask.. I am not in execution group. do not bother checking other peer VRF');
  }
  /*********
   * based on the exists of global.nodeSimCache.computeTasks. I know I am one of the execution group.
   * So I will check other peers verify their VRF and figure out who is the executor. 
   */


  o('debug', `I am in the taskCid:${taskCid} execution group. I need to check other peers VRF making sure no hacker invovled. My role is,`, global.nodeSimCache.computeTaskPeersMgr.checkMyRoleInTask(taskCid));
  const task = block.pendingTasks[taskCid];

  const existingPeersInGroup = global.nodeSimCache.computeTaskPeersMgr.getPeersInGroup(taskCid);
  const peersInBlockPending = Object.values(task. followUps).map(v=>v.peerId);
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

  differences.added.forEach(async (addedPeer)=>{
    
    if(addedPeer == global.ipfs._peerInfo.id.toB58String()) return;//this is myself
    
    const handleRpcResponse = (taskCid)=>async (res, err)=>{
      if(err){
        return o('error', `response from other peer ${addedPeer} on reqVerifyPeerVrfForComputeTasks has error`, err, res);
      }
      if(global.nodeSimCache.computeTaskPeersMgr.isPeerInGroup(addedPeer)){
        o('debug', `The peer ${addedPeer} is already in my groupPeers. No need to verify and add again.return`);
        return;
      }
      const {type, taskCid:othersPeerTaskCid, myVrfProofInfo:otherPeerVrfProofInfo, myRoleProofInfo: othersRoleProofInfo} = res;
      
      console.assert(othersPeerTaskCid == taskCid), 'other Peer response taskCid need to be the same as mine';
      console.assert(type == "resVerifyPeerVrfForComputeTasks", 'make sure the response type is resVerifyPeerVrfForComputeTasks');
      
      let validationResult = false;
      try{
        if(othersRoleProofInfo && global.nodeSimCache.computeTaskPeersMgr.validateOthersRoleProofInfo(taskCid, othersRoleProofInfo)){
          global.nodeSimCache.computeTaskPeersMgr.addOtherPeerToMyExecutionPeers(taskCid, addedPeer, otherPeerVrfProofInfo);
          o('log', `addedPeer: I verified another peer username:${otherPeerVrfProofInfo.userName} successfully. I have added him into my execution group`);
          return;
        }
        const blockCid = global.blockMgr.getBlockCidByHeight(otherPeerVrfProofInfo.blockHeightWhenVRF);
        
        const block = (await global.ipfs.dag.get(blockCid)).value;
        if(otherPeerVrfProofInfo && global.nodeSimCache.computeTaskPeersMgr.validateOtherPeerVrfProofInfo(taskCid, otherPeerVrfProofInfo, blockCid, block)){
          global.nodeSimCache.computeTaskPeersMgr.addOtherPeerToMyExecutionPeers(taskCid, addedPeer, otherPeerVrfProofInfo);
          o('log', `added Peer: I verified another peer username:${otherPeerVrfProofInfo.userName} successfully. I have added him into my execution group`);
          return;   
        }
        else{
          o('error', `Validate other peer ${addedPeer} information failed. I cannot add him to my list. In the future, I should report 
          this to Layer One because that peer could be a hacker trying to peek who is the VRF winner and plan DDoS attack. 
          At this moment, we do not do anything. In the future, one possible solution is to abort this whole process and do it again 
          after a pentalty to the possible hacker `);
          return;
        }
      }
      catch(err){
        o('error', `differences.added.forEach when validating otherPeerVrf, exception:${err}`);
      }
    }
    const requestToOtherPeerForProof = {
      type:'reqVerifyPeerVrfForComputeTasks',
      taskCid,
      blockHeight: block.height
    }
    switch( global.nodeSimCache.computeTaskPeersMgr.checkMyRoleInTask(taskCid)){
      case ComputeTaskRoles.taskOwner:
          requestToOtherPeerForProof.myRoleProofInfo = {
          role:'taskOwner',
          proof:'placeholder'
        };
        break;
      case ComputeTaskRoles.lambdaOwner:
          requestToOtherPeerForProof.myRoleProofInfo = {
          role:'lambdaOwner',
          proof:'placeholder'
        };
        break;
      case ComputeTaskRoles.executeGroupMember:
          requestToOtherPeerForProof.myVrfProofInfo = global.nodeSimCache.computeTaskPeersMgr.getMyVrfProofInfo(taskCid);
        break;
      default:
        throw "We have to have a role in the executeGroup, a taskOwner, lambdaOwner, or just executeGroupMember, cannot be nothing," + global.nodeSimCache.computeTaskPeersMgr.debugOutput(taskCid);
    }
  
    global.rpcEvent.emit('rpcRequest', {
      sendToPeerId:addedPeer, 
      message:JSON.stringify(requestToOtherPeerForProof), 
      responseCallBack:handleRpcResponse(taskCid)
    });
    o('debug', `I ${global.userInfo.userName} send out a rpcReqeust to peer ${addedPeer}`);
  });


  
  differences.removed.forEach(removedPeer=>{
    /****
   * 
   * for code below
   * 
   * I do not know why the peer will be removed. but just in case
   */
    o('error', `I do not know in what situation a peer would be removed from execution group`)
    global.nodeSimCache.computeTaskPeersMgr.removePeerFromGroup(taskCid, removedPeer);
  })
}


const handlePendingComputeTaskStart = (block)=> async (taskCid)=>{
 
    
  if(global.userInfo.userName == global.nodeSimCache.computeTaskPeersMgr.getExecutorName(taskCid)){
    o('log', "I am the executor. Its time for me to run taskCid:", c);
    try{executeCompute(taskCid, task);}
    catch(e){
      o('error', "executeCompute error", e);
    }
  }else{
    o('log', `I am the monitor, the executor is ${global.nodeSimCache.computeTaskPeersMgr.getExecutorName(taskCid)}. i am doing the remote attestatio now.... Not impletmented yet`);
  }

}

exports.handlePendingComputeTask = handlePendingComputeTask;