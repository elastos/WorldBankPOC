const roomMessageHandler = require('./roomMeesageHandler');



module.exports = (ipfs, room) => {
  const option = {};
  const roomName = 'townHall';
  const messageHandlers = [];
  
  const peerJoinedHandler = (peer)=>console.log('peer ' + peer + ' joined');
  messageHandlers.push({message: 'peer joined', handler: peerJoinedHandler});
  const peerLeftHandler = (peer) => console.log('peer ' + peer + ' left');
  messageHandlers.push({message: 'peer left', handler: peerLeftHandler});
  messageHandlers.push({message: 'peer joined', handler: (peer) => console.log(peer + ' joined the Townhall!')});
  messageHandlers.push({message:'subscribed', handler: (m) => {console.log("...... subscribe....", m)}});
  
  const handler = async (message) => {
    //(message) => console.log('In townhall got message from ' + message.from + ': ' + message.data.toString())
    const cid = message.data.toString();
    
    try{
      const newBlockObj = await ipfs.dag.get(cid);
    }
    catch(e){
      return console.log("cid is not a CID, return without doing anything,", cid);
    }
    try{
      const newBlockObj = await ipfs.dag.get(cid);
      console.log("using dag, we got towhall object,", newBlockObj.value);
      console.log("Now let's treverse the new block to genesis so that we can get a latest state");
      const state = {
        height: newBlockObj.value.height
      };
      state.txs = await getLatestState(cid);
      console.log("last State is:", state);
    }
    catch(e){
      console.log("exception in townhall", e);
    }
    
  };
  
  messageHandlers.push({
    message: 'message',
    handler
  });

  const getLatestState = async (cid) => {
    let fullTxs = [];
    let currentBlockObj;
    let prevBlockCid =  cid;
    while (prevBlockCid){
      currentBlockObj = await ipfs.dag.get(prevBlockCid);
      for(var i = 0; i < currentBlockObj.value.txs.length; i ++){
        const txCid = currentBlockObj.value.txs[i];
        const tx = await ipfs.dag.get(txCid);
        fullTxs.unshift(tx.value.content);
      };
      prevBlockCid = currentBlockObj.value.previousBlockCid;
      
    }
    console.log("--before return - fullTxs is,", fullTxs);
    return fullTxs;
  }

  return messageHandlers;
}

