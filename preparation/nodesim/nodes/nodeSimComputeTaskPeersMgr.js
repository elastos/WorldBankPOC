import autoBind from 'auto-bind';
import {ComputeTaskRoles} from '../shared/constValue';
import { o } from '../shared/utilities';
import {expectNumberOfRemoteAttestatorsToBeVoted, minimalNewNodeJoinRaDeposit, 
  expectNumberOfExecutorGroupToBeVoted, ComputeTaskRole} from '../shared/constValue';
import Big from 'big.js';
import {sha256} from 'js-sha256';
const {ecvrf, sortition} = require('vrf.js');



export default class{
  constructor(ipfs){
    this._taskObj = {},
    this._ipfs = ipfs;
    autoBind(this);
  }

  debugOutput(taskCid){
    if(! taskCid){
      o('debug', this._taskObj);
      return;
    }
    console.debug('debugOutput for CopmputTaskPeersMgr.js', this._taskObj[taskCid]);
  }
  addNewComputeTask(taskCid){
    
    if(this._taskObj[taskCid]) return ;
    const taskObj = {
      taskCid,
      groupPeers: {},
    }
    

    this._taskObj[taskCid] = taskObj;
  }

  async assignSpecialRoleToTask(taskCid, userName){
    if(! this._taskObj[taskCid]) throw 'computeTaskMgr did not init taskObj';
    if(this._taskObj[taskCid].myRole) return this._taskObj[taskCid].myRole;

    const task = (await this._ipfs.dag.get(taskCid)).value;
    if(userName == task.userName){
      return this._taskObj[taskCid].myRole = ComputeTaskRoles.taskOwner;
    }
    const lambda = (await this._ipfs.dag.get(task.lambdaCid)).value;
    if(lambda.ownerName == userName){
      return this._taskObj[taskCid].myRole = ComputeTaskRoles.lambdaOwner;
    }
    
  }

  checkMyRoleInTask(taskCid){
    if(! this._taskObj[taskCid])  return undefined;
    return this._taskObj[taskCid].myRole;
  }

  addMyVrfProofToTask(taskCid, myVrfProofInfo){
    this._taskObj[taskCid].myRole = ComputeTaskRoles.executeGroupMember;
    return this._taskObj[taskCid].myVrfProofInfo = myVrfProofInfo;
  }

  getMyVrfProofInfo(taskCid){
    return Object.assign({}, this._taskObj[taskCid].myVrfProofInfo);
  }

  static tryVrfForComputeTask(block, taskCid, userInfo ){
    const blockCid = global.blockMgr.getBlockCidByHeight(block.blockHeight);
    const myCurrentCreditBalance = block.creditMap[userInfo.userName];
    const vrfMsg = sha256.update(blockCid).update(taskCid).hex();
    const p = expectNumberOfExecutorGroupToBeVoted / block.totalCreditForOnlineNodes;
    //console.log("VRFing.... this takes some time, please be patient..., ", userInfo, vrfMsg);
    const { proof, value } = ecvrf.vrf(Buffer.from(userInfo.publicKey, 'hex'), Buffer.from(userInfo.privateKey, 'hex'), Buffer.from(vrfMsg, 'hex'));
    //console.log("VRF{ proof, value }", { proof:proof.toString('hex'), value: value.toString('hex') });
    //console.log("Now running VRF sortition...it also needs some time... please be patient...", myCurrentCreditBalance, p);
    const j = sortition.getVotes(value, new Big(myCurrentCreditBalance), new Big(p));
    
    return {
      result:j.gt(0),
      j:j.toFixed(),
      blockHeightWhenVRF:block.blockHeight,
      proof:proof.toString('hex'),
      value: value.toString('hex'),
      taskCid,
      publicKey:userInfo.publicKey,
      userName: userInfo.userName
    }
  }

  validateOtherPeerVrfProofInfo(taskCid, otherPeerVrfProofInfo, blockCid, block){
    if(! otherPeerVrfProofInfo)
      return false;
    try{
      if(this._taskObj[taskCid].myRole == ComputeTaskRoles.executeGroupMember){
        const myVrfProofInfo = this.getMyVrfProofInfo(taskCid);
        if(myVrfProofInfo.blockHeightWhenVRF != otherPeerVrfProofInfo.blockHeightWhenVRF){
          const err = `Other peer userName:${otherPeerVrfProofInfo.userName} is using a different 
            blockHeightWhenVrf ${otherPeerVrfProofInfo.blockHeightWhenVRF} than mine ${myVrfProofInfo.blockHeightWhenVRF}
            I cannot verify if he is valid. So have to drop`;
          o('error', err);
          return false;
        }
        if(myVrfProofInfo.taskCid != otherPeerVrfProofInfo.taskCid){
          const err = `Other peer userName:${otherPeerVrfProofInfo.userName} is using a different 
          taskCid ${otherPeerVrfProofInfo.taskCid} than mine ${myVrfProofInfo.taskCid}
          I cannot verify if he is valid. So have to drop`;
          o('error', err);
          return false;
        }
      }
    
    }
    catch(e){
      o('error', 'inside validateOtherPeerVrfProofInfo exception:', e, otherPeerVrfProofInfo);
      return false;
    }
    
    const otherPeerCreditBalance = block.creditMap[otherPeerVrfProofInfo.userName];
    const vrfMsg = sha256.update(blockCid).update(taskCid).hex();
    const p = expectNumberOfExecutorGroupToBeVoted / block.totalCreditForOnlineNodes;
    const vrfVerifyResult = ecvrf.verify(Buffer.from(otherPeerVrfProofInfo.publicKey, 'hex'), Buffer.from(vrfMsg, 'hex'),  Buffer.from(otherPeerVrfProofInfo.proof, 'hex'), Buffer.from(otherPeerVrfProofInfo.value, 'hex'));
    if(! vrfVerifyResult){
      o('error', `validate Other peer VRF failed.`, vrfVerifyResult, otherPeerVrfProofInfo);
      return false;
    }
    const jVerify = sortition.getVotes(Buffer.from(otherPeerVrfProofInfo.value, 'hex'), new Big(otherPeerCreditBalance), new Big(p));
    if(jVerify != otherPeerVrfProofInfo.j){
      o('error', `verifyOther peer failed on J value. other claim J is ${otherPeerVrfProofInfo.j}, but my calculation result J is ${jVerify.toFixed()}`);
      return false;
    }
    return true;
  }

  getExecutorName(taskCid){
    const executor = this.getExecutor(taskCid);
    if(!executor)  return null;
    return executor.userName;
  }

  getExecutorPeer(taskCid){
    return this._taskObj[taskCid].executor;
  }
  getExecutor(taskCid){
    const executorPeer = this.getExecutorPeer(taskCid);
    if (! executorPeer) return null;
    return this._taskObj[taskCid].groupPeers[executorPeer];
  }
  setExecutorPeer(taskCid, peer){
    this._taskObj[taskCid].executor = peer;
  }
 
  validateOthersRoleProofInfo(taskCid, othersRoleProofInfo){
    o('debug', 'inside validateOthersRoleProofInfo now, ', othersRoleProofInfo);
    if(!othersRoleProofInfo)  return false;
    o('debug', 'inside validateOthersRoleProofInfo 2 ');
    
    if(othersRoleProofInfo.role == 'taskOwner'){
      if(othersRoleProofInfo.proof)  {
        return true
      }
      else return false;
    }
    o('debug', 'inside validateOthersRoleProofInfo 3 ');
    
    if(othersRoleProofInfo.role == 'lambdaOwner'){
      if(othersRoleProofInfo.proof)  {
        return true
      }
      else return false;
    }
    o('debug', 'inside validateOthersRoleProofInfo 4 ');
    
    return false;
  }
  validateOthersPeerAlreadyInMyPeerList(taskCid, otherPeer){
    return this._taskObj[taskCid].groupPeers[otherPeer]? true: false;
  }

  setLambdaOwnerPeer(taskCid, peer){
    this._taskObj[taskCid].lambdaOwnerPeer = peer;
  }

  setTaskOwnerPeer(taskCid, peer){
    this._taskObj[taskCid].taskOwnerPeer = peer;
  }
  addOtherPeerToMyExecutionPeers(taskCid, peer, otherPeerVrfInfo){
    this._taskObj[taskCid].groupPeers[peer] = otherPeerVrfInfo;

    /*****
       * 
       * compare existing groupPeers's exeuctor. We always trying to keep the exeuctor has the hightest J and lowest random value
       * If any new added peer has a higher J value, and lower random vlaue, he will be the executor.
       * We compure both J and value. 
       * If J is higher, he is new executor, if J is the same, then compare the random value.  If the new added
       * peer has lower random value, he is new executor
       */
    if(! this.getExecutor(taskCid)){
      this.setExecutorPeer(taskCid, peer);
      return
    }
    
    const currentExecutor = this.getExecutor(taskCid);
    if(currentExecutor.j < otherPeerVrfInfo.j){
      this.setExecutorPeer(taskCid, peer);
      return
    }
    if(currentExecutor.j == otherPeerVrfInfo.j){
      if(currentExecutor.value > otherPeerVrfInfo.value){
        this.setExecutorPeer(taskCid, peer);
        return;
      }

    }
    /*******
     * Ref to the code above
     * Now we have got the this._taskObj[taskCid].executor to be highest J and lowest random value
     * If every node run the same algorithm, they will have the same executor.
     * Anyone who cannot get the same executor, their final reward application will be rejected by layerone, so he won't get reward and wate time and escrow money
     */
  }

  getPeersInGroup(taskCid){
    return Object.keys(this._taskObj[taskCid].groupPeers)
  }

  isPeerInGroup(taskCid, peer){
    try{
      if( this._taskObj[taskCid].groupPeers[peer])
      return true;
    }
    catch(e){
      return false;
    }
  }

  removePeerFromGroup(taskCid, peer){
    if(this._taskObj[taskCid].executor == peer){
      /** this is a little bit complex. because we cannot just delete the executor
       * we need to remove all peers from groupPeers and add them back except the to-be-delete
       * one. The addOtherPeerToMyExecutionPeers() will automatically find the executor
       */
      const tempObj = {...this._taskObj[taskCid].groupPeers};
      this._taskObj[taskCid].groupPeers = {};
      delete this._taskObj[taskCid].executor
      Object.keys(tempObj).forEach((p)=>{
        if(p != peer)
          this.addOtherPeerToMyExecutionPeers(taskCid, p, tempObj[p]);
      })

    }else{
      /**  this is simple, because we do not need to recalculate the executor (largest j, smallest value). just delete */
      delete this._taskObj[taskCid].groupPeers[peer];
    }
  }
  
}