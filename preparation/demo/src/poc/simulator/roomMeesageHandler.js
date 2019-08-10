const Room = require('ipfs-pubsub-room')

module.exports = (ipfs, roomName, messageHandler) =>{
  console.log("line4", roomName, messageHandler);
  const room = Room(ipfs, roomName);
  const handlers = messageHandler(room);
  handlers.map ((m)=>{
    room.on(m.message, m.handler);
  });
  
  return room;
};