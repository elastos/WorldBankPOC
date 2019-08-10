const roomMessageHandler = require('./roomMeesageHandler');
module.exports = (room) => {
  const option = {};
  const roomName = 'blockRoom';
  const messageHandlers = [];
  
  const peerJoinedHandler = (peer)=>console.log('peer ' + peer + ' joined block room');
  messageHandlers.push({message: 'peer joined', handler: peerJoinedHandler});
  const peerLeftHandler = (peer) => console.log('peer ' + peer + ' left block room');
  messageHandlers.push({message: 'peer left', handler: peerLeftHandler});
  messageHandlers.push({message: 'peer joined', handler: (peer) => room.sendTo(peer, 'Hello ' + peer + ' welcome join the block Room!')});
  messageHandlers.push({message:'subscribed', handler: (m) => {console.log("...... subscribe....", m)}});
  messageHandlers.push({
    message: 'message',
    handler: (message) => {
      try {
        const block = JSON.parse(message.data);
        handleBlock(block);
        console.log('a new block from' + message.from + '..... block is:', block);
      }
      catch (e){
        console.log('In block room got message from ' + message.from + ': ' + message.data.toString())
      }
    }
  });
  return messageHandlers;
};

const handleBlock = (block)=>{

};
