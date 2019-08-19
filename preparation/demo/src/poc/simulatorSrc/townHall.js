import {tryParseJson, logToWebPage, updateLog} from './utils';
const {utils, ecvrf, sortition} = require('vrf.js');
import {sha256} from 'js-sha256';
import Big from 'big.js';
import {validateVrf, validatePot, verifyOthersRemoteAttestationVrfAndProof}  from '../remoteAttestation';


module.exports = (ipfs, room, options) => {
  const option = {};
  const roomName = 'townHall';
  const messageHandlers = [];
  
  const peerJoinedHandler = (peer)=>console.log('peer ' + peer + ' joined');
  messageHandlers.push({message: 'peer joined', handler: peerJoinedHandler});
  const peerLeftHandler = (peer) => console.log('peer ' + peer + ' left');
  messageHandlers.push({message: 'peer left', handler: peerLeftHandler});
  messageHandlers.push({message:'subscribed', handler: (m) => {console.log("...... subscribe....", m)}});


  const directMessageHandler = async (message) => {
    console.log('In townhall got message from ' + message.from + ': ' + message.data.toString());
    const messageObj = tryParseJson(message.data.toString());
    if(! messageObj)
      return console.log("townHallMessageHandler received non-parsable message, ", messageString);
    switch(messageObj.type){
      case "reqUserInfo":{
        const {userInfo} = options;
        const {userName, publicKey} = userInfo;

        const resMessage = {
          type:'resUserInfo',
          userInfo:{userName, publicKey}
        }
        room.sendTo(message.from, JSON.stringify(resMessage));
        logToWebPage(`send back reqUserInfo to townhall manager`, resMessage);
        break;
      }

      case "reqRemoteAttestation":{//Now I am new node, sending back poT after validate the remote attestation is real
        const {userInfo} = options;
        const {userName, publicKey} = userInfo;
        const validateReturn = await validateVrf({ipfs, messageObj});
        if(! validateReturn.result){
          logToWebPage(`VRF Validation failed, reason is `, validateReturn.reason);
          break;
        }
        logToWebPage(`VRF Validation passed`);
        const proofOfTrust = window.proofOfTrustTest? window.proofOfTrustTest : {
          psrData:'placeholder',
          isHacked:false,
          tpmPublicKey:'placeholder'
        }
        const resRemoteAttestationObj = {
          type:'resRemoteAttestation',
          proofOfVrf:messageObj,
          proofOfTrust
        }

        room.sendTo(message.from, JSON.stringify(resRemoteAttestationObj));

        updateLog('req_ra', {
          name : userName,
          vrf : true,
          cid : messageObj.taskCid,
          proofOfVrf: messageObj,
          proofOfTrust
        });
        
        logToWebPage(`send back resRemoteAttestation to the remote attestator ${message.from}, payload is `, resRemoteAttestationObj);
        break;
      }

      case "resRemoteAttestation":{//now, I am the remote attestator, validate new node
        logToWebPage(`I am a Remote Attestator, I received new node${message.from} 's reply :, payload is `, messageObj);
        const newNodePeerId = message.from;
        const {proofOfVrf, proofOfTrust} = messageObj;
        const potResult = validatePot(proofOfTrust);
        logToWebPage(`Proof of trust verify result: ${potResult}`);
        const cid = await ipfs.dag.put({potResult,proofOfTrust,proofOfVrf});
        const remoteAttestationDoneMsg = {
          txType:'remoteAttestationDone',
          cid: cid.toBaseEncodedString()
        }
        options.rooms.taskRoom.broadcast(JSON.stringify(remoteAttestationDoneMsg))
        logToWebPage(`Broadcast in taskRoom about the Proof of trust verify result: ${potResult}`);

        const {userInfo} = options;
        updateLog('res_ra', {
          name : userInfo.userName,
          cid : proofOfVrf.taskCid,
          potResult
        });
        
        break;
      }
      // case "remoteAttestationDone":{
      //   if(message.from != options.userInfo.ipfsPeerId){//I do not want to verify myself vrf and remote attestation
      //     if(! verifyOthersRemoteAttestationVrfAndProof(messageObj)){
      //       logToWebPage(`Found other node did wrong remote attestation VRF or PoT. Further action is not implemented yet. Just alert here for now. ${JSON.stringify}`)
      //     }
          
      //   }
      //   break;
      // }
      default:{
        return console.log("townHallMessageHandler received unknown type message object,", messageObj );
      } 
    }//switch
    
  };
    

  messageHandlers.push({
    message: 'message',
    handler: (m)=>directMessageHandler(m)
  });
  
  return messageHandlers;

};