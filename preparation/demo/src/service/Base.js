import potSchema from '../poc/potSchema';
import gasSim from '../poc/gasSim';
import creditScheam from '../poc/creditSchema';

class Util {
  async getPeer(peerId){
    const peer = await potSchema.findOne({peerId}).exec();
    return peer;
  }
  async getGas(peerId){
    const gas = await gasSim.get(peerId);
    return gas.gasBalance;
  }
  async getScore(peerId){
    const cs = await creditScheam.get(peerId);
    return cs.creditScore;
  }

  async setGas(peerId, gas){
    return await gasSim.set(peerId, gas);
  }
};

export default class {

  constructor(){
    this.util = new Util();
  }

  getService(Service){
    return new Service();
  }
};