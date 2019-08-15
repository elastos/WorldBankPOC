import {tryParseJson} from '../constValue'
import { ExceptionHandler, exceptions } from 'winston';

module.exports = (ipfs, room, options) => {
  const messageHandlers = [];
  
  const peerJoinedHandler = (peer)=>console.log('peer ' + peer + ' joined block room');
  messageHandlers.push({message: 'peer joined', handler: peerJoinedHandler});
  const peerLeftHandler = (peer) => console.log('peer ' + peer + ' left block room');
  messageHandlers.push({message: 'peer left', handler: peerLeftHandler});
  messageHandlers.push({message: 'peer joined', handler: (peer) => room.sendTo(peer, 'Hello ' + peer + ' welcome join the block Room!')});
  messageHandlers.push({message:'subscribed', handler: (m) => {console.log("...... subscribe....", m)}});
  messageHandlers.push({
    message: 'message',
    handler: async (message) => {
      
      const blockObj = tryParseJson(message.data);
      if(typeof blockObj == 'undefined'){
        
        return console.log('In block room got an non-parsable message from ' + message.from + ': ' + message.data.toString());
      }
      const {txType, cid} = blockObj;
      if(txType != 'newBlock'){
        return console.log('In block room got an unhandled message from ' + message.from + ': ' + message.data.toString());
      }
      const block = await ipfs.dag.get(cid);
      console.log("received block:", block);
      if(options.isProcessingBlock){
        throw new exceptions("Racing conditions found. Some async funciton is processing block while new block just came in, how to handle this issue?");
      }
      options.block = block.value;
      processNewBlock(options);
    }
  });
  return messageHandlers;
};

const processNewBlock = async (options)=>{
  options.isProcessingBlock = true;
  if (verifyBlockIntegrity()){
    options.block.processedTxs
  }
  options.isProcessingBlock = false;
  const watchingTxTypes = ['newNodeJoinNeedRa','remoteAttestationDone'];
  const newNodeJoinNeedRaTxsCid = [];
  const remoteAttestationDoneTxsCid = [];
  options.block.processedTxs.forEach((tx)=>{
    if(tx.txType == 'newNodeJoinNeedRa')  newNodeJoinNeedRaTxsCid.push(tx.cid);
    if(tx.txType == 'remoteAttestationDone')  remoteAttestationDoneTxsCid.push(tx.cid);
    
  });

  await handleNewNodeJoinNeedRa(newNodeJoinNeedRaTxsCid, options);
  await handleRemoteAttestationDone(remoteAttestationDoneTxsCid, options);
}

const verifyBlockIntegrity = (options)=>{
  //Place holder, did not do anything yet, assume the block is valid
  return true;
}

const handleNewNodeJoinNeedRa = async (newNodeJoinNeedRaTxsCid, options)=>{
  const {ipfs} = options;
  const promises = newNodeJoinNeedRaTxsCid.map((cid)=>{

    return ipfs.dag.get(cid)
  })
  const txs = await Promise.all(promises);
  txs.forEach(tx=>{
    console.log("received a RA task",tx.value);
  })
  
}
const handleRemoteAttestationDone = async (remoteAttestationDoneTxsCid, options)=>{
  const {ipfs} = options;
  const promises = remoteAttestationDoneTxsCid.map((cid)=>{

    return ipfs.dag.get(cid)
  })
  const txs = await Promise.all(promises);
  txs.forEach(tx=>{
    console.log("received a raDone task",tx.value);
  })
  
}




