import {tryParseJson, logToWebPage} from './utils';
const {utils, ecvrf, sortition} = require('vrf.js');
import {sha256} from 'js-sha256';
const Big = require('big.js');
import {validateVrf, validatePot, verifyOthersRemoteAttestationVrfAndProof}  from './remoteAttestation';


module.exports = (ipfs, room, options) => {
  const option = {};
  const roomName = 'taskRoom';
  const messageHandlers = [];
  
  const peerJoinedHandler = (peer)=>console.log('peer ' + peer + ' joined task room');
  messageHandlers.push({message: 'peer joined', handler: peerJoinedHandler});
  const peerLeftHandler = (peer) => console.log('peer ' + peer + ' left task room');
  messageHandlers.push({message: 'peer left', handler: peerLeftHandler});
  messageHandlers.push({message:'subscribed', handler: (m) => {console.log("...... subscribe....", m)}});
  return messageHandlers;
};
