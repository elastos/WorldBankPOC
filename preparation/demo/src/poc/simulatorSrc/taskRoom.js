import {tryParseJson, logToWebPage} from './utils';

module.exports = (ipfs, room, options) => {
  const option = {};
  const roomName = 'taskRoom';
  const messageHandlers = [];
  
  const peerJoinedHandler = (peer)=>console.log('peer ' + peer + ' joined task room');
  messageHandlers.push({message: 'peer joined', handler: peerJoinedHandler});
  const peerLeftHandler = (peer) => console.log('peer ' + peer + ' left task room');
  messageHandlers.push({message: 'peer left', handler: peerLeftHandler});
  messageHandlers.push({message:'subscribed', handler: (m) => {console.log("...... subscribe....", m)}});
  
  const directMessageHandler = (message) => {
    
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
        const result = await validateVrf({ipfs, remoteAttestatorPeerId, messageObj});

        // validateVrf({ipfs, remoteAttestatorPeerId, messageObj}).then((res)=>{

        //   logToWebPage( `validateVrf is not implemented yet, just return ${res} for nwo`);

        // },
        // (rej)=>{
        //   logToWebPage( `validateVrf is not implemented yet, assume it failed, just return ${rej} for nwo`);

        // });
        const resMessage = {
          type:'resRemoteAttestation',
          userInfo:{userName, publicKey}
        }
        room.sendTo(message.from, JSON.stringify(resMessage));
        logToWebPage(`send back resRemoteAttestation to the remote attestator ${message.from}, payload is ${JSON.stringify(resMessage)}`);
        break;


      case "resRemoteAttestation":
        logToWebPage(`I am a Remote Attestator, I received new node${message.from} 's reply :, payload is ${message.data.toString()}`);
        validatePot();
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
  return ipfs.dag.get(blockCid);
};

// const validateVrf = ({ipfs, remoteAttestatorPeerId, messageObj})=>{
//   return new Promise( (resolve, reject)=>{
//     const {j, proof, value, blockCid, taskCid} = messageObj;
//     if(!j || !proof || !value || !blockCid || !taskCid){
//       return reject(`The incoming message missing some properties, ${JSON.stringify(messageObj)}.`);
//     }
//     ipfs.dag.get(blockCid).then((block)=>{
//       console.log("retreieve block,", block);
//     })
//     .then(()=>{
//       return ipfs.dag.get(taskCid);
//     })
//     .then((task)=>{
//       console.log("taskCid from IPFS", taskCid);
//       resolve(true);
//     })
//   });
// };

const validatePot = ()=>{
  logToWebPage(`inside validatePot, not impletemented yet. Just return true`);
}