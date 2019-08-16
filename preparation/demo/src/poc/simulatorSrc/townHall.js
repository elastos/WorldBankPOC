const roomMessageHandler = require('./roomMeesageHandler');
import {tryParseJson, logToWebPage} from './utils';


module.exports = (ipfs, room, options) => {
  const option = {};
  const roomName = 'townHall';
  const messageHandlers = [];
  
  const peerJoinedHandler = (peer)=>console.log('peer ' + peer + ' joined');
  messageHandlers.push({message: 'peer joined', handler: peerJoinedHandler});
  const peerLeftHandler = (peer) => console.log('peer ' + peer + ' left');
  messageHandlers.push({message: 'peer left', handler: peerLeftHandler});
  messageHandlers.push({message:'subscribed', handler: (m) => {console.log("...... subscribe....", m)}});

  const directMessageHandler = (message) => {
    //(message) => console.log('In townhall got message from ' + message.from + ': ' + message.data.toString())
    const messageObj = tryParseJson(message.data.toString());
    if(! messageObj)
      return console.log("townHallMessageHandler received non-parsable message, ", messageString);
    switch(messageObj.type){
      case "reqUserInfo":
        const {userInfo} = options;
        const {userName, publicKey} = userInfo;

        const resMessage = {
          type:'resUserInfo',
          userInfo:{userName, publicKey}
        }
        room.sendTo(message.from, JSON.stringify(resMessage));
        logToWebPage(`send back reqUserInfo to townhall manager, ${JSON.stringify(resMessage)}`);
        break;
      default:
        return console.log("townHallMessageHandler received unknown type message object,", messageObj );
    }
    
  };
    
  messageHandlers.push({
    message: 'message',
    handler: directMessageHandler
  });
  return messageHandlers;
};