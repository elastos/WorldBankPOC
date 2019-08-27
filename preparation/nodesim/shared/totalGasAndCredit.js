import { o } from "./utilities";

export default class TotalGasAndCredit {
  constructor(){
    this._totalGas = 0;
    this._totalCredit = 0;
    this._totalCreditOnlineOnly = 0;
    this._lastBlockHeight = 0;
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
    for( const c in block.trustedPeerToUserInfo){
      const currUserInfo = trustedPeerToUserInfo[c];
      totalCreditForOnlineNodes += creditMap[currUserInfo.userName];
    }
    this._totalGas = totalGas;
    this._totalCredit = totalCredit;
    this._totalCreditOnlineOnly = totalCreditForOnlineNodes;
    this._lastBlockHeight = height;
  }

  getCurrentTotalGasAndCredit(){
    return {
      totalGas: this._totalGas,
      totalCredit: this._totalCredit,
      totalCreditOnlineOnly: this._totalCreditOnlineOnly,
      height: this._lastBlockHeight
    }
  }
}