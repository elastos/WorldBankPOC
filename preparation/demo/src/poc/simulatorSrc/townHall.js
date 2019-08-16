const roomMessageHandler = require('./roomMeesageHandler');
import {tryParseJson} from '../constValue';


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
        delete userInfo.randRoomPostfix;
        delete userInfo.privateKey;

        const resMessage = {
          type:'resUserInfo',
          userInfo
        }
        room.sendTo(message.from, JSON.stringify(resMessage));
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