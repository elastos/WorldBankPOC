import {tryParseJson, logToWebPage} from './utils'
import { ExceptionHandler, exceptions } from 'winston';
const {utils, ecvrf, sortition} = require('vrf.js');
import {sha256} from 'js-sha256';
import {sendRemoteAttestationRequest} from './remoteAttestation';

const Big = require('big.js');




const processNewBlock = async (options)=>{
  const ipfs = options.ipfs;

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
  
  let totalCreditForOnlineNodes = 0;
  for( const c in block.trustedPeerToUserInfo){
    const currUserInfo = block.trustedPeerToUserInfo[c];
    totalCreditForOnlineNodes += block.creditMap[currUserInfo.userName];
  }

  updateNodeStatusOnNewBlock(options, totalGas, totalCredit, totalCreditForOnlineNodes);
  const watchingTxTypes = ['newNodeJoinNeedRa','remoteAttestationDone'];
  const newNodeJoinNeedRaTxsCid = [];
  const remoteAttestationDoneTxsCid = [];
  
 
  block.processedTxs.forEach((tx)=>{
    if(tx.txType == 'newNodeJoinNeedRa')  newNodeJoinNeedRaTxsCid.push(tx.cid);
    if(tx.txType == 'remoteAttestationDone')  remoteAttestationDoneTxsCid.push(tx.cid);
    
  });
  
  const userCreditBalance = block.creditMap[userInfo.userName];
  
  newNodeJoinNeedRaTxsCid.map((cid)=>{
    ipfs.dag.get(cid).then(tx=>{
      if(tx.value.ipfsPeerId == userInfo.ipfsPeerId){
        console.log("I am the node myself, I cannot do remote attestation on myself, skip");
        return;
      }
      const {blockCid} = options;
      console.log("received a RA task",tx.value, blockCid, cid);
      const vrfMsg = sha256.update(blockCid).update(cid).hex();
      const p = 5 / totalCreditForOnlineNodes;
      console.log("VRFing.... this takes some time, please be patient..., ", userInfo, vrfMsg);
      const { proof, value } = ecvrf.vrf(Buffer.from(userInfo.pubicKey, 'hex'), Buffer.from(userInfo.privateKey, 'hex'), Buffer.from(vrfMsg, 'hex'));
      console.log("VRF{ proof, value }", { proof:proof.toString('hex'), value: value.toString('hex') });
      console.log("Now running VRF sortition...it also needs some time... please be patient...");
      const j = sortition.getVotes(value, new Big(userCreditBalance), new Big(p));
      if(j.gt(0)){
        console.log("I am lucky!!!", j.toFixed());
        logToWebPage(`I am lucky!! J is ${j.toFixed()}`);
        sendRemoteAttestationRequest({tx, options, j, proof, value, blockCid, taskCid:cid, publicKey:userInfo.pubicKey});
      }else{
        console.log("bad luck, try next", j.toFixed());
        logToWebPage(`bad luck, try next time`);
        
      }
      

    })
  });
  
  remoteAttestationDoneTxsCid.map((cid)=>{
    ipfs.dag.get(cid).then(tx=>{
      console.log("received a RADone task, not implemented yet",tx.value);
      logToWebPage(`Blockroom Received a RA Done Message ${JSON.stringify(tx)}`);
    })
  });

  options.isProcessingBlock = false;
  return options;
  
}

const verifyBlockIntegrity = (options)=>{
  //Place holder, did not do anything yet, assume the block is valid
  return true;
}




const updateNodeStatusOnNewBlock = ({block, userInfo} , totalGas, totalCredit, totalCreditForOnlineNodes)=>{
  const userName = userInfo.userName;
  const blockHeight = block.blockHeight;
  const gasBalance = block.gasMap[userName] || "";
  const creditBalance = block.creditMap[userName] || "";

  try{
    document.getElementById('blockheight').innerHTML = blockHeight;
    document.getElementById('gasbalance').innerHTML = gasBalance;
    document.getElementById('creditbalance').innerHTML = creditBalance;
    document.getElementById('totalgas').innerHTML = totalGas;
    document.getElementById('totalcredit').innerHTML = totalCredit;
    document.getElementById('totalcredit_onlineonly').innerHTML = totalCreditForOnlineNodes;
    
  }catch(e){console.log('updateNodeStatusOnNewBlock, ', e)} 
}


const blockRoom = (ipfs, room, options) => {
  const messageHandlers = [];
  
  const peerJoinedHandler = (peer)=>console.log('peer ' + peer + ' joined block room');
  messageHandlers.push({message: 'peer joined', handler: peerJoinedHandler});
  const peerLeftHandler = (peer) => console.log('peer ' + peer + ' left block room');
  messageHandlers.push({message: 'peer left', handler: peerLeftHandler});
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
      logToWebPage(`Received new block Height: ${block.value.blockHeight}`);
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

blockRoom.processNewBlock = processNewBlock;
module.exports = blockRoom;