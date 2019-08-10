import potSchema from '../poc/potSchema';
import gasSim from '../poc/gasSim';
import creditScheam from '../poc/creditSchema';
import constant from './constant';
import sha256 from 'js-sha256';
import txLogSchema from '../poc/txLogSchema';

class Util {
  async getPeer(peerId){
    const peer = await potSchema.findOne({peerId}).exec();
    return peer;
  }
  async getGas(peerId){
    const gas = await gasSim.get(peerId);
    return gas.gasBalance;
  }
  gasSchema(){
    return gasSim;
  }
  creditSchema(){
    return creditScheam;
  }
  txLogSchema(){
    return txLogSchema;
  }
  async getScore(peerId){
    const cs = await creditScheam.get(peerId);
    return cs.creditScore;
  }

  async setGas(peerId, gas){
    return await gasSim.set(peerId, gas);
  }

  async transferGasToEscrow(fromPeerId, amt, referenceEventType, referenceEventId){
    return await gasSim.transferGas(fromPeerId, constant.gasBurnPeerId, amt, referenceEventType, referenceEventId);
  }

  async transferGasFromEscrow(toPeerId, amt, referenceEventType, referenceEventId){
    return await gasSim.transferGas(constant.gasFaucetPeerId, toPeerId, amt, referenceEventType, referenceEventId); 
  }

  async transferCreditFromPool(toPeerId, amt, referenceEventType, referenceEventId){
    return await creditScheam.transferCreditBalanced(constant.CREDIT_SCORE_POOL, toPeerId, amt, referenceEventType, referenceEventId);
  }
  async transferCreditToPool(fromPeerId, amt, referenceEventType, referenceEventId){
    return await creditScheam.transferCreditBalanced(fromPeerId, constant.CREDIT_SCORE_POOL, amt, referenceEventType, referenceEventId);
  }

  hash(str){
    return sha256(str);
  }

};

export default class {

  constructor(){
    this.util = new Util();

    if(this.init){
      this.init();
    }
  }

  getService(Service){
    return new Service();
  }
};