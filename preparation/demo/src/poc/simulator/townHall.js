const roomMessageHandler = require('./roomMeesageHandler');



module.exports = (ipfs, room) => {
  const option = {};
  const roomName = 'townHall';
  const messageHandlers = [];
  
  const peerJoinedHandler = (peer)=>console.log('peer ' + peer + ' joined');
  messageHandlers.push({message: 'peer joined', handler: peerJoinedHandler});
  const peerLeftHandler = (peer) => console.log('peer ' + peer + ' left');
  messageHandlers.push({message: 'peer left', handler: peerLeftHandler});
  messageHandlers.push({message: 'peer joined', handler: (peer) => room.sendTo(peer, 'Hello ' + peer + ' joined the Townhall!')});
  messageHandlers.push({message:'subscribed', handler: (m) => {console.log("...... subscribe....", m)}});
  
  const handler = async (message) => {
    //(message) => console.log('In townhall got message from ' + message.from + ': ' + message.data.toString())
    const cid = message.data.toString();
    console.log("cid,", cid);
    try{
      const sentObj = await ipfs.dag.get(cid);
      console.log("using dag, we got towhall object,", sentObj.value);
      const tree = await ipfs.dag.tree(cid);
      console.log("Display in tree format:", tree);
    }
    catch(e){
      console.log("towHall received a message not a CID:", message);
    }
    
  };
  
  messageHandlers.push({
    message: 'message',
    handler
  });


  return messageHandlers;
}

