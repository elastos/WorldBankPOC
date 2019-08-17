import {tryParseJson, logToWebPage} from './utils';
const {utils, ecvrf, sortition} = require('vrf.js');
import {sha256} from 'js-sha256';
const Big = require('big.js');

module.exports = (ipfs, room, options) => {
  const option = {};
  const roomName = 'taskRoom';
  const messageHandlers = [];
  
  const peerJoinedHandler = (peer)=>console.log('peer ' + peer + ' joined task room');
  messageHandlers.push({message: 'peer joined', handler: peerJoinedHandler});
  const peerLeftHandler = (peer) => console.log('peer ' + peer + ' left task room');
  messageHandlers.push({message: 'peer left', handler: peerLeftHandler});
  messageHandlers.push({message:'subscribed', handler: (m) => {console.log("...... subscribe....", m)}});
  
  const directMessageHandler = async (message) => {
    
    (message) => console.log('In taskRoom got message from ' + message.from + ': ' + message.data.toString())
    const messageObj = tryParseJson(message.data.toString());
    if(! messageObj)
      return console.log("taskRoom MessageHandler received non-parsable message, ", messageString);
    logToWebPage(`Receive taskRoom message from ${message.from}, json:${message.data.toString()}`);
    switch(messageObj.type){
      case "reqRemoteAttestation":
        const {userInfo} = options;
        const {userName, publicKey} = userInfo;
        const remoteAttestatorPeerId = message.from;
        const validateReturn = await validateVrf({ipfs, remoteAttestatorPeerId, messageObj});
        if(! validateReturn.result){
          logToWebPage(`VRF Validation failed, reason is ${validateReturn.reason}`);
          break;
        }
        logToWebPage(`VRF Validation passed`);
        const proofOfTrust ={
          psrData:'placeholder',
          isHacked:true,
          tpmPublicKey:'placeholder'
        }
        const resRemoteAttestationObj = {
          type:'resRemoteAttestation',
          proofOfTrust
        }

        room.sendTo(message.from, JSON.stringify(resRemoteAttestationObj));
        
        logToWebPage(`send back resRemoteAttestation to the remote attestator ${message.from}, payload is ${JSON.stringify(resRemoteAttestationObj)}`);
        break;


      case "resRemoteAttestation":
        logToWebPage(`I am a Remote Attestator, I received new node${message.from} 's reply :, payload is ${message.data.toString()}`);
        const newNodePeerId = message.from;
        
        const potResult = validatePot(messageObj.proofOfTrust);
        logToWebPage(`Proof of trust verify result: ${potResult}`);
        
        break;
      
      default:
        return console.log("taskRoom MessageHandler received unknown type message object,", messageObj );
    }
    
  };
  messageHandlers.push({
    message: 'message',
    handler: directMessageHandler
  });
  return messageHandlers;
};

const validateVrf = async ({ipfs, remoteAttestatorPeerId, messageObj})=>{
  const {j, proof, value, blockCid, taskCid, publicKey} = messageObj;
  if(!j || !proof || !value || !blockCid || !taskCid || !publicKey){
    return {result:false, reason:`The incoming message missing some properties, ${JSON.stringify(messageObj)}.`};
  }
  const block = (await ipfs.dag.get(blockCid)).value;

  let totalCreditForOnlineNodes = 0;
  for( const c in block.trustedPeerToUserInfo){
    const currUserInfo = block.trustedPeerToUserInfo[c];
    totalCreditForOnlineNodes += block.creditMap[currUserInfo.userName];
  }
  const vrfMsg = sha256.update(blockCid).update(taskCid).hex();
  
  const p = 5 / totalCreditForOnlineNodes;

  const remoteAttestatorUserInfo = block.trustedPeerToUserInfo[remoteAttestatorPeerId];
  
  const vrfVerifyResult = ecvrf.verify(Buffer.from(publicKey, 'hex'), Buffer.from(vrfMsg, 'hex'), Buffer.from(proof, 'hex'), Buffer.from(value, 'hex'));
  if(! vrfVerifyResult){
    return {result: false, reason:'VRF verify failed'};
  }
  const remoteAttestatorCreditBalance = block.creditMap[remoteAttestatorUserInfo.userName];
  console.log('remoteAttestatorCreditBalance', remoteAttestatorCreditBalance);
  const jVerify = sortition.getVotes(Buffer.from(value, 'hex'), new Big(remoteAttestatorCreditBalance), new Big(p));
  if(jVerify.toFixed() != j){
    console.log("vrf soritition failed,", jVerify.toFixed());
    return {result: false, reason:'VRF Sortition failed'  + jVerify.toFixed()};
  }
  return {result:true};
};

const validatePot = (proofOfTrust)=>{
  const {psrData, isHacked, tpmPublicKey} = proofOfTrust;

  return ! isHacked;
}