import {o} from './utilities';
import _ from 'lodash';

export default class BlockMgr{
  constructor(ipfs, timeoutSeconds = 600000/* after 10 minutes, the block content will be removed to save memory. Cid will be left for future retrieve */){
    this._ipfs = ipfs;
    this._timeoutSeconds = timeoutSeconds;
    this._blockHistory = {};
    this._maxHeight = 0;
  }
  pushNewBlock(height, cid){
    if(this._blockHistory[height]){
      if(this._blockHistory[height] != cid){
        o('error', 'Find a new block with existing height but the cid is different. This should not happen', {height, cid});
        return;
      }else{
        return;
      }
    }else{
      this._blockHistory[height] = {cid};
      if(height > this._maxHeight) this._maxHeight = height;
    }
  }
  getBlockCidByHeight(height){
    return this._blockHistory[height]? this._blockHistory[height].cid: undefined;
  }

  async getBlockByHeight  (height){
    if(!this._blockHistory[height] || ! this._blockHistory[height].cid)
      return undefined;
    const cid = this._blockHistory[height].cid;
    const blockObj = await this._ipfs.dag.get(cid);
    if( ! blockObj){
      o('error', 'blockCid cannot be found from ipfs.dag', cid);
      return undefined;
    }
    this._blockHistory[height].block = blockObj.value;
    if(this._timeoutSeconds > 0){
      _.delay((height)=>{
        delete this._blockHistory[height].block;
      }, this._timeoutSeconds, height)
    }
    return blockObj.value;

  }

  getMaxHeight (){return this._maxHeight};
}