import txLogSchema from '../poc/txLogSchema';

import Base from './Base';
import constant from './constant';

export default class extends Base {
  async depositGasForTask(peerId, amt, type){
    const data = {
      fromPeerId : peerId,
      toPeerId : constant.gasBurnPeerId,
      amt,
      tokenType : 'gas',
      referenceEventType : type,
      referenceEventId : peerId
    };

    return await txLogSchema.create(data);
  }
};