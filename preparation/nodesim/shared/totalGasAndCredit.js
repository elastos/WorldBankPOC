import { o } from "./utilities";
import autoBind from 'auto-bind';

export default class TotalGasAndCredit {
  constructor(){
    this._totalGas = 0;
    this._totalCredit = 0;
    this.totalCreditForOnlineNodes = 0;
    this._lastBlockHeight = 0;
    autoBind(this);
  }

  async updateOnNewBlock({height, cid}){
    if(height <= this._lastBlockHeight) return;
    const block = await global.blockMgr.getBlockByHeight(height);
    let totalGas = 0;
    for(const g in block.gasMap){
      totalGas += block.gasMap[g];
    }
    
    let totalCredit = 0;
    for(const c in block.creditMap){
      totalCredit += block.creditMap[c];
    }
    
    //calculate totalCredit for online users
    let totalCreditForOnlineNodes = 0;
    if(block.trustedPeerToUserInfo){
      for( const c in block.trustedPeerToUserInfo){
        const currUserInfo = block.trustedPeerToUserInfo[c];
        totalCreditForOnlineNodes += block.creditMap[currUserInfo.userName];
      }
    }
    this._totalGas = totalGas;
    this._totalCredit = totalCredit;
    this.totalCreditForOnlineNodes = totalCreditForOnlineNodes;
    this._lastBlockHeight = height;
    
  }

  getCurrentTotalGasAndCredit(){
    return {
      totalGas: this._totalGas,
      totalCredit: this._totalCredit,
      totalCreditForOnlineNodes: this.totalCreditForOnlineNodes,
      height: this._lastBlockHeight
    }
  }
}