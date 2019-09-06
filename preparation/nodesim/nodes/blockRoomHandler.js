import {o, tryParseJson} from '../shared/utilities';

exports.messageHandler = (ipfs)=>async (message)=>{
  const blockObj = tryParseJson(message.data);
  if(typeof blockObj == 'undefined'){
    
    return o('error', 'In block room got an non-parsable message from ' + message.from + ': ' + message.data.toString());
  }
  const {txType, cid, height} = blockObj;
  if(txType != 'newBlock'){
    return o('error', 'In block room got an unhandled message from ' + message.from + ': ' + message.data.toString());
  }
  global.blockMgr.pushNewBlock(height, cid);
  
}
