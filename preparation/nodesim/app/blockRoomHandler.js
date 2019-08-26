import {o} from './utilities';

exports.messageHandler = (ipfs)=>async (message)=>{
  const blockObj = tryParseJson(message.data);
  if(typeof blockObj == 'undefined'){
    
    return o('error', 'In block room got an non-parsable message from ' + message.from + ': ' + message.data.toString());
  }
  const {txType, cid} = blockObj;
  if(txType != 'newBlock'){
    return o('error', 'In block room got an unhandled message from ' + message.from + ': ' + message.data.toString());
  }
  const block = await ipfs.dag.get(cid);
  if(! global.blockHistory)  global.blockHistory = {};
  global.blockHistory[block.value.blockHeight] = cid;
  console.log("received block height=", block.value.blockHeight);
  //logToWebPage(`Received new block Height: ${block.value.blockHeight}`);
  if(options.isProcessingBlock){
    throw new Exceptions("Racing conditions found. Some async funciton is processing block while new block just came in, how to handle this issue?");
  }
  options.block = block.value;
  options.blockCid = cid;
  options.isProcessingBlock = true;
  processNewBlock(options);
  options.isProcessingBlock = false;
}