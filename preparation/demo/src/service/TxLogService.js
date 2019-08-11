import txLogSchema from '../poc/txLogSchema';
import gasSim from '../poc/gasSim';

import Base from './Base';
import constant from './constant';

export default class extends Base {
  async depositGasForTask(peerId, amt, type){
    // const data = {
    //   fromPeerId : peerId,
    //   toPeerId : constant.gasBurnPeerId,
    //   amt,
    //   tokenType : 'gas',
    //   referenceEventType : type,
    //   referenceEventId : peerId
    // };

    // return await txLogSchema.create(data);

    return await this.util.transferGasToEscrow(peerId, amt, type, peerId);
  }

  async rewardGasToPeer(rewardPeer, gas){
    return await this.util.transferGasFromEscrow(rewardPeer, gas, constant.txlog_type.REWARD_GAS, rewardPeer);
  }
  async rewardCreditToPeer(rewardPeer, credit){
    return await this.util.transferCreditFromPool(rewardPeer, credit, constant.txlog_type.REWARD_CREDIT, rewardPeer);
  }
  async penaltyCreditFromPeer(penaltyPeer, credit){
    return await this.util.transferCreditToPool(penaltyPeer, credit, constant.txlog_type.PENALTY_CREDIT, penaltyPeer);
  }
  async rewardCreditForRaPass(peer, credit=1){
    return await this.util.transferCreditFromPool(peer, credit, constant.txlog_type.REWARD_CREDIT_FOR_RA_PASS, peer);
  }



};