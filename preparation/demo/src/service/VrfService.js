import Base from './Base';
import constant from './constant';
import _ from 'lodash';

export default class extends Base {
  async create(peer){
    const outputHash = _.random(0, 1, true);//'placeHolderForOutputHash' of course, this is not a vrf, just a regular random for test purpose
    const pi = 'placeHolderForPi';
    return {
      pi, outputHash
    };
  }
  async verify(){

  }
  async weightedThreshold(peerId){
    const creditScore = await this.util.getScore(peerId);
    const weight = creditScore / constant.MAX_CREDIT_SCORE;
    return weight * constant.EACH_CREDIT_SCORE_FOR_VRF;
  }
  async luckyDraw(peer){
    const vrf = await this.create(peer);
    const threshold = await this.weightedThreshold(peer.peerId);
    const vrfHash = vrf.outputHash;
    console.log('lucky draw =>', vrfHash, threshold);
    if(vrfHash < threshold){
      return {result: true, vrf};
    }
    else{
      return {result: false, vrf};
    }
  }
};