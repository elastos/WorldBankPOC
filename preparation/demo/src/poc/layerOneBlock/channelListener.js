import roomMessageHandler from '../simulator/roomMeesageHandler';

const createGenesysBlock = async (globalState, ipfs)=>{
  globalState.txsPool = [];
  globalState.gasMap = {};
  globalState.blockHeight = 0;
  return globalState;

}

const taskRoomHandler = (ipfs, room) => {
  const option = {};
  const roomName = 'taskRoom';
  const messageHandlers = [];
  
  const peerJoinedHandler = (peer)=>console.log('peer ' + peer + ' joined task room');
  messageHandlers.push({message: 'peer joined', handler: peerJoinedHandler});
  const peerLeftHandler = (peer) => console.log('peer ' + peer + ' left task room');
  messageHandlers.push({message: 'peer left', handler: peerLeftHandler});
  messageHandlers.push({message: 'peer joined', handler: (peer) => room.sendTo(peer, 'Hello ' + peer + ' welcome join the Task Room!')});
  messageHandlers.push({message:'subscribed', handler: (m) => {console.log("...... subscribe task room....", m)}});
  messageHandlers.push({
    message: 'message',
    handler: (message) => console.log('In task room got message from ' + message.from + ': ' + message.data.toString())
  });
  return messageHandlers;
};

const townHallHandler = (ipfs, room) => {
  const option = {};
  const roomName = 'townHall';
  const messageHandlers = [];
  
  const peerJoinedHandler = (peer)=>console.log('peer ' + peer + ' joined townhall room');
  messageHandlers.push({message: 'peer joined', handler: peerJoinedHandler});
  const peerLeftHandler = (peer) => console.log('peer ' + peer + ' left townhall room');
  messageHandlers.push({message: 'peer left', handler: peerLeftHandler});
  messageHandlers.push({message: 'peer joined', handler: (peer) => room.sendTo(peer, 'Hello ' + peer + ' welcome join the townhall Room!')});
  messageHandlers.push({message:'subscribed', handler: (m) => {console.log("...... subscribe towhall....", m)}});
  messageHandlers.push({
    message: 'message',
    handler: (message) => console.log('In townhall room got message from ' + message.from + ': ' + message.data.toString())
  });
  return messageHandlers;
};

const blockRoomHandler = (ipfs, room) => {
  const option = {};
  const roomName = 'blockRoom';
  const messageHandlers = [];
  
  const peerJoinedHandler = (peer)=>console.log('peer ' + peer + ' joined block room');
  messageHandlers.push({message: 'peer joined', handler: peerJoinedHandler});
  const peerLeftHandler = (peer) => console.log('peer ' + peer + ' left block room');
  messageHandlers.push({message: 'peer left', handler: peerLeftHandler});
  messageHandlers.push({message: 'peer joined', handler: (peer) => room.sendTo(peer, 'Hello ' + peer + ' welcome join the block Room!')});
  messageHandlers.push({message:'subscribed', handler: (m) => {console.log("...... subscribe blockroom....", m)}});
  messageHandlers.push({
    message: 'message',
    handler: (message) => console.log('In block room got message from ' + message.from + ': ' + message.data.toString())
  });
  return messageHandlers;
};




export default (globalState) =>{
  return (ipfs)=>{
    //We assume every time we start the demo, it starts from genesis block
    globalState.block = createGenesysBlock(globalState, ipfs);

    
    const rooms = {};
    rooms.taskRoom = roomMessageHandler(ipfs, 'taskRoom', taskRoomHandler);
    rooms.towHall = roomMessageHandler(ipfs, 'townHall', townHallHandler);
    rooms.blockRoom = roomMessageHandler(ipfs, 'blockRoom', blockRoomHandler);
    return rooms;
  }
};