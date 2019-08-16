import {tryParseJson} from '../constValue'
import { ExceptionHandler, exceptions } from 'winston';
const {utils, ecvrf, sortition} = require('vrf.js');
import {sha256} from 'js-sha256';
const Big = require('big.js');


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
      console.log("received block height=", block.value.blockHeight);
      if(options.isProcessingBlock){
        throw new exceptions("Racing conditions found. Some async funciton is processing block while new block just came in, how to handle this issue?");
      }
      options.block = block.value;
      options.blockCid = cid;
      processNewBlock(options);
    }
  });
  return messageHandlers;
};

const processNewBlock = async (options)=>{
  options.isProcessingBlock = true;
  const {userInfo, block} = options;
  if (verifyBlockIntegrity()){
    options.block.processedTxs
  }
  let totalGas = 0;
  for(const g in block.gasMap){
    totalGas += block.gasMap[g];
  }
  
  let totalCredit = 0;
  for(const c in block.creditMap){
    totalCredit += block.creditMap[c];
  }
  updateNodeStatusOnNewBlock(options, totalGas, totalCredit);
  const watchingTxTypes = ['newNodeJoinNeedRa','remoteAttestationDone'];
  const newNodeJoinNeedRaTxsCid = [];
  const remoteAttestationDoneTxsCid = [];
  
 
  block.processedTxs.forEach((tx)=>{
    if(tx.txType == 'newNodeJoinNeedRa')  newNodeJoinNeedRaTxsCid.push(tx.cid);
    if(tx.txType == 'remoteAttestationDone')  remoteAttestationDoneTxsCid.push(tx.cid);
    
  });
  
  const userGasBalance = block.gasMap[userInfo.userName];
  
  newNodeJoinNeedRaTxsCid.map((cid)=>{
    ipfs.dag.get(cid).then(tx=>{
      console.log("received a RA task",tx.value, options.blockCid, cid);
      const vrfMsg = sha256.update(options.blockCid).update(cid).hex();
      const p = 5 / totalGas;
      console.log("VRFing.... this takes some time, please be patient..., ", userInfo, vrfMsg);
      const { proof, value } = ecvrf.vrf(Buffer.from(userInfo.pubicKey, 'hex'), Buffer.from(userInfo.privateKey, 'hex'), Buffer.from(vrfMsg, 'hex'));
      console.log("VRF{ proof, value }", { proof:proof.toString('hex'), value: value.toString('hex') });
      console.log("Now running VRF sortition...it also needs some time... please be patient...", userGasBalance, p);
      const j = sortition.getVotes(value, new Big(userGasBalance), new Big(p));
      if(j.gt(0)){
        console.log("I am lucky!!!", j.toFixed());
      }else{
        console.log("bad luck, try next", j.toFixed());
      }
      

    })
  });
  
  remoteAttestationDoneTxsCid.map((cid)=>{
    ipfs.dag.get(cid).then(tx=>{
      console.log("received a RADone task, not implemented yet",tx.value);
      
    })
  });

  options.isProcessingBlock = false;
  
}

const verifyBlockIntegrity = (options)=>{
  //Place holder, did not do anything yet, assume the block is valid
  return true;
}




const updateNodeStatusOnNewBlock = ({block, userInfo} , totalGas, totalCredit)=>{
  const userName = userInfo.userName;
  const blockHeight = block.blockHeight;
  const gasBalance = block.gasMap[userName] || "";
  const creditBalance = block.creditMap[userName] || "";

  
  document.getElementById('blockheight').innerHTML = blockHeight;
  document.getElementById('gasbalance').innerHTML = gasBalance;
  document.getElementById('creditbalance').innerHTML = creditBalance;
  document.getElementById('totalgas').innerHTML = totalGas;
  document.getElementById('totalcredit').innerHTML = totalCredit;
  //document.getElementById('').innerHTML = ;
  

}