import TaskSchema from './TaskSchema';
import constant from './constant';

import Base from './Base';
import TxLogService from './TxLogService';

export default class extends Base {

  async createNewCaculateTask(ownerPeerId, gasAmount){
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
    await txService.depositGasForTask(ownerPeerId, gasAmount, constant.TXLOG_TYPE.CACULATE);

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
};