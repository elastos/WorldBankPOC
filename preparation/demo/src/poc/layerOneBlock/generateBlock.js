


exports.generateBlock = async ({ipfs, globalState, blockRoom})=>{
  //console.log("generating block, globalState:", globalState);

  runSettlementBeforeNewBlock(ipfs, globalState);

  const {gasMap, creditMap, processedTxs, previousBlockHeight, previousBlockCid, trustedPeerToUserInfo, escrowGasMap, pendingTasks} = globalState;
//calculate totalCredit for online users
  let totalCreditForOnlineNodes = 0;
  for( const c in trustedPeerToUserInfo){
    const currUserInfo = trustedPeerToUserInfo[c];
    totalCreditForOnlineNodes += creditMap[currUserInfo.userName];
  }


  const peerProfile = globalState.peerProfile;

  const newBlock = {
    peerProfile,
    gasMap,
    creditMap,
    processedTxs,
    blockHeight: previousBlockHeight + 1,
    previousBlockCid,
    trustedPeerToUserInfo,
    totalCreditForOnlineNodes,
    escrowGasMap,
    pendingTasks
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
  globalState.previousBlockHeight = globalState.blockHeight;
  return newBlock;
}

const runSettlementBeforeNewBlock = async (ipfs, globalState)=>{
  const pendingTasks = globalState.pendingTasks || {};
  const promises = Object.keys(pendingTasks).map( async (taskCid)=>{
    const task = await ipfs.dag.get(taskCid);
    switch(task.txType){
      case 'newNodeJoinNeedRa':{

        break;
      }
    }
    return task? task.value : null;
  });
  const results = await Promise.all(promises);
  console.log('allPendingTasks,', results);
  globalState.processedTxs = [];
};