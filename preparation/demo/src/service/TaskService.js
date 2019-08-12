import TaskSchema from './TaskSchema';
import TaskLogSchema from './TaskLogSchema';
import constant from './constant';
import _ from 'lodash';

import Base from './Base';
import TxLogService from './TxLogService';
import VrfService from './VrfService';


export default class extends Base {

  async createNewCalculateTask(ownerPeerId, gasAmount){
    if(gasAmount < 10){
      throw 'Task gas must greater than 10';
    }

    // check owner peerId
    const peer = await this.util.getPeer(ownerPeerId);
    if(!peer){
      throw 'invalid peer id => '+ownerPeerId;
    }

    const credit = await this.util.getScore(ownerPeerId);
    if(credit < 1){
      throw 'Peer not in trust network, can not create task';
    }

    // check peer gas
    const gas = await this.util.getGas(ownerPeerId);
    if(gas < gasAmount){
      throw 'peer gas does not enough';
    }

    // deposit gas
    const txService = this.getService(TxLogService);
    await txService.depositGasForTask(ownerPeerId, gasAmount, constant.txlog_type.PUBLISH_CALCULATE);

    // create
    const data = {
      peerId : ownerPeerId,
      name : `Test calculate task by peer[${ownerPeerId}]`,
      description : 'calculate task description',
      amount : gasAmount,
      status : constant.task_status.ELECT,
      type : constant.task_type.CALCULATE,
      joiner : []
    };
    const rs = await TaskSchema.create(data);

    // decrease gas
    // await this.util.setGas(ownerPeerId, gas-gasAmount);

    // log
    await TaskLogSchema.logForCreated(rs._id, ownerPeerId);

    return rs;
  }

  async createNewRATask(ownerPeerId){
    // check owner peerId
    const peer = await this.util.getPeer(ownerPeerId);
    if(!peer){
      throw 'invalid peer id => '+ownerPeerId;
    }

    const credit = await this.util.getScore(ownerPeerId);
    if(credit > 0){
      throw 'Already in trust network.';
    }

    // check peer gas
    const gas = await this.util.getGas(ownerPeerId);
    if(gas < constant.RA_TASK_GAS){
      throw 'peer gas needs at least '+ constant.RA_TASK_GAS + ' for RA';
    }

    const txService = this.getService(TxLogService);
    await txService.depositGasForTask(ownerPeerId, constant.RA_TASK_GAS, constant.txlog_type.PUBLISH_RA);

    // create
    const data = {
      peerId : ownerPeerId,
      name : `RA for peer[${ownerPeerId}]`,
      description : 'RA for peer[${ownerPeerId}]',
      amount : constant.RA_TASK_GAS,
      status : constant.task_status.ELECT,
      type : constant.task_type.REMOTE_ATTESTATION,
      joiner : []
    };
    const rs = await TaskSchema.create(data);

    // decrease gas
    // await this.util.setGas(ownerPeerId, gas-gasAmount);

    // log
    await TaskLogSchema.logForCreated(rs._id, ownerPeerId);

    return rs;
  }

  async joinToElectHandleTask(peerId, taskId){
    const task = await TaskSchema.findOne({_id: taskId}).exec();
    if(!task){
      throw 'invalid task id => '+taskId;
    }

    const peer = await this.util.getPeer(peerId);
    if(!peer){
      throw 'invalid peer id => '+ownerPeerId;
    }

    if(task.status !== constant.task_status.ELECT){
      throw 'Task is not in elect status';
    }

    const credit = await this.util.getScore(peerId);
    if(credit < 1){
      throw 'Peer not in trust network, could not join';
    }

    // check gas
    const gas = await this.util.getGas(peerId);
    if(gas < task.amount){
      throw 'Does not has enough gas to join';
    }

    // lucky draw
    const vrfService = this.getService(VrfService);
    const ld = await vrfService.luckyDraw(peer);
    if(!ld.result){
      throw 'not lucky enough';
    }

    // add joiner
    await this.addTaskJoiner(task, peer);

    _.delay(()=>{
      this.startTaskProcess(taskId);
    }, 10);

    return true;
  }

  async startTaskProcess(taskId){
    const task = await TaskSchema.findOne({_id: taskId}).exec();
    if(task.joiner.length < constant.MAX_TASK_JOINER){
      console.log(`Joiner : ${task.joiner.length}, not enough, wait others`);
      return false;
    }

    await TaskSchema.setStatus(taskId, constant.task_status.PROCESSING);

    await TaskLogSchema.logForReadyToProcess(taskId);

    if(task.type === constant.task_type.CALCULATE){
      await this.caculateTaskProcess(task);
    }
    else if(task.type === constant.task_type.REMOTE_ATTESTATION){
      await this.raTaskProcess(task);
    }

    return true;
  }

  async caculateTaskProcess(task){
    const taskId = task._id;
    const vrfService = this.getService(VrfService);
    const txService = this.getService(TxLogService);

    // calculate each node weightedThreshold to produce a winner
    let winner = '';
    let tmp_w = 0;
    for(let i=0, len=task.joiner.length; i<len; i++){
      const w = await vrfService.weightedThreshold(task.joiner[i]);
      if(w > tmp_w){
        tmp_w = w;
        winner = task.joiner[i];
      }
    }
    await TaskLogSchema.logForSelectWinner(taskId, winner);

    // each joiner produce the task result
    const peer_result = {};
    for(let i=0, len=task.joiner.length; i<len; i++){
      const rs = await this.produceJoinerResult(task.joiner[i]);
      _.set(peer_result, task.joiner[i], rs);
    }
    await TaskLogSchema.logForProduceJoinerResult(taskId, peer_result);

    // run consensus
    const {rewardPeers, penaltyPeers} = await this.runConsensus(peer_result, winner);
    await TaskLogSchema.logForRunConsensus(taskId, rewardPeers, penaltyPeers);

    // reward and penalty
    await TaskLogSchema.logForReadyToReward(taskId);
    const gas_reward = (task.amount*(1+penaltyPeers.length))/rewardPeers.length;
    const result_peer = {};
    for(let i=0, len=rewardPeers.length; i<len; i++){
      const rp = rewardPeers[i];
      result_peer[rp] = {
        gas : gas_reward,
        credit : constant.REWARD_FOR_CREDIT_SCORE
      };
      await txService.rewardGasToPeer(rp, task.amount + gas_reward);
      await txService.rewardCreditToPeer(rp, constant.REWARD_FOR_CREDIT_SCORE);
    }
    for(let i=0, len=penaltyPeers.length; i<len; i++){
      const pp = penaltyPeers[i];
      result_peer[pp] = {
        gas : 0,
        credit : -constant.PENALTY_FOR_CREDIT_SCORE
      };
      await txService.penaltyCreditFromPeer(pp, constant.PENALTY_FOR_CREDIT_SCORE);
    }
    await TaskLogSchema.logForRewardFinish(taskId, result_peer);

    // finish
    await TaskSchema.setStatus(taskId, constant.task_status.COMPLETED);
    await TaskLogSchema.logForFinish(taskId);
  }

  async runConsensus(peer_result, winner){
    // include smart contract execute

    const winner_result = peer_result[winner];
    const rewardPeers = [];
    const penaltyPeers = [];

    _.each(peer_result, (rs, peer)=>{
      if(rs === winner_result){
        rewardPeers.push(peer);
      }
      else{
        penaltyPeers.push(peer);
      }
    });

    return {
      rewardPeers,
      penaltyPeers
    }
  }

  async raConsensus(peer_result){
    const rewardPeers = [];
    const penaltyPeers = [];

    _.each(peer_result, (rs, peer)=>{
      if(rs === true){
        rewardPeers.push(peer);
      }
      else{
        penaltyPeers.push(peer);
      }
    });

    return {
      rewardPeers,
      penaltyPeers
    }
  }

  async produceJoinerResult(joinerPeerId){
    // return true;
    return _.random(1, 9)%2;
  }

  async addTaskJoiner(task, peer){
    // check peer join before or not
    if(_.includes(task.joiner, peer.peerId)){
      throw 'Already join';
    }

    // deposit gas
    const txService = this.getService(TxLogService);
    await txService.depositGasForTask(peer.peerId, task.amount, constant.txlog_type.JOIN_CALCULATE);

    //log
    await TaskLogSchema.logForJoin(task._id, peer.peerId);

    return await TaskSchema.addTaskJoiner(peer.peerId, task._id);
  }

  async getAllTask(query){
    return await TaskSchema.find(query).sort({
      updatedAt: -1
    }).exec();
  }
  async getAllTaskLog(query){
    return await TaskLogSchema.find(query).sort({
      updatedAt: 1
    }).exec();
  }


  async raTaskProcess(task){
    const taskId = task._id;
    const vrfService = this.getService(VrfService);
    const txService = this.getService(TxLogService);

    // each joiner produce the ra result
    const peer_result = {};
    for(let i=0, len=task.joiner.length; i<len; i++){
      const rs = await vrfService.verifyPeer(task.joiner[i], task.peerId);
      _.set(peer_result, task.joiner[i], rs);
    }
    await TaskLogSchema.logForProduceJoinerResult(taskId, peer_result);

    // run consensus
    const {rewardPeers, penaltyPeers} = await this.raConsensus(peer_result);
    await TaskLogSchema.logForRunConsensus(taskId, rewardPeers, penaltyPeers);

    if(rewardPeers.length > Math.floor(constant.MAX_TASK_JOINER/2)){
      // ra pass, increase credit 1
      await txService.rewardCreditForRaPass(task.peerId, 1);
    }

    // reward and penalty
    await TaskLogSchema.logForReadyToReward(taskId);
    const gas_reward = (task.amount*(1+penaltyPeers.length))/rewardPeers.length;
    const result_peer = {};
    for(let i=0, len=rewardPeers.length; i<len; i++){
      const rp = rewardPeers[i];
      result_peer[rp] = {
        gas : gas_reward,
        credit : constant.REWARD_FOR_CREDIT_SCORE
      };
      await txService.rewardGasToPeer(rp, task.amount + gas_reward);
      await txService.rewardCreditToPeer(rp, constant.REWARD_FOR_CREDIT_SCORE);
    }
    for(let i=0, len=penaltyPeers.length; i<len; i++){
      const pp = penaltyPeers[i];
      result_peer[pp] = {
        gas : 0,
        credit : -constant.PENALTY_FOR_CREDIT_SCORE
      };
      await txService.penaltyCreditFromPeer(pp, constant.PENALTY_FOR_CREDIT_SCORE);
    }
    await TaskLogSchema.logForRewardFinish(taskId, result_peer);

    // finish
    await TaskSchema.setStatus(taskId, constant.task_status.COMPLETED);
    await TaskLogSchema.logForFinish(taskId);
  }


};