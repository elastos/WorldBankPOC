


exports.generateBlock = async ({ipfs, globalState, blockRoom})=>{
  //console.log("generating block, globalState:", globalState);
  const gasMap = globalState.gasMap;
  const creditMap = globalState.creditMap;
  const processedTxs = globalState.txPool;
  const previousBlockHeight = globalState.blockHeight || 0;
  const previousBlockCid = globalState.blockCid || "";
  globalState.txPool = [];

  const newBlock = {
    gasMap,
    creditMap,
    processedTxs,
    blockHeight: previousBlockHeight + 1,
    previousBlockCid
  };
  globalState.blockHeight = newBlock.blockHeight; 
  globalState.blockCid = "generating new block CID, please wait";//while generating block, set the blockCid to 0 for temperary because of async await, other code may run into globalState.blockCid while await is waiting for new blockCid.
  const newBlockCid = await ipfs.dag.put(newBlock);
  globalState.blockCid = newBlockCid.toBaseEncodedString();
  const broadcastObj = {
    txType:'newBlock',
    cid:newBlockCid.toBaseEncodedString()
  }
  // console.log("before blockRoom broadcast, the obj,", broadcastObj)
  blockRoom.broadcast(JSON.stringify(broadcastObj))
}

