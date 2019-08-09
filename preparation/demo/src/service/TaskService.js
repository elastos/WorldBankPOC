import TaskSchema from './TaskSchema';
import constant from './constant';
import _ from 'lodash';

import Base from './Base';
import TxLogService from './TxLogService';
import VrfService from './VrfService';


export default class extends Base {

  async createNewCaculateTask(ownerPeerId, gasAmount){
    if(gasAmount < 10){
      throw 'Task gas must greater than 10';
    }

    // check owner peerId
    const peer = await this.util.getPeer(ownerPeerId);
    if(!peer){
      throw 'invalid peer id => '+ownerPeerId;
    }

    // check peer gas
    const gas = await this.util.getGas(ownerPeerId);
    if(gas < gasAmount){
      throw 'peer gas does not enough';
    }

    // deposit gas
    const txService = this.getService(TxLogService);
    await txService.depositGasForTask(ownerPeerId, gasAmount, constant.txlog_type.PUBLISH_CACULATE);

    // create
    const data = {
      peerId : ownerPeerId,
      name : `Test caculate task by peer[${ownerPeerId}]`,
      description : 'caculate task description',
      amount : gasAmount,
      status : constant.task_status.ELECT,
      type : constant.task_type.CACULATE,
      joiner : []
    };
    const rs = await TaskSchema.create(data);

    // decrease gas
    await this.util.setGas(ownerPeerId, gas-gasAmount);

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

    if(task.status !== constant.task_type.ELECT){
      throw 'Task is not in elect status';
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
      throw 'not lucky enought';
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


  }


  async addTaskJoiner(task, peer){
    // check peer join before or not
    if(_.includes(task.joiner, peer.peerId)){
      throw 'Already join';
    }

    // deposit gas
    const txService = this.getService(TxLogService);
    await txService.depositGasForTask(peer.peerId, task.amount, constant.txlog_type.JOIN_CACULATE);

    return await TaskSchema.addTaskJoiner(peer.peerId, task._id);
  }



};