import roomMessageHandler from '../simulator/roomMeesageHandler';
import townHallMessageHandler from './townHallMessageHandler';
const createGenesysBlock = async (globalState, ipfs)=>{
  globalState.txsPool = [];
  globalState.gasMap = {};
  globalState.blockHeight = 0;
  return globalState;

}

const taskRoomHandlers = (ipfs, room, options) => {
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

const townHallHandlers = (ipfs, room, options) => {
  const option = {};
  const roomName = 'townHall';
  const messageHandlers = [];
  const {globalState} = options;
  const peerJoinedHandler = (peer)=>console.log('peer ' + peer + ' joined townhall room');
  messageHandlers.push({message: 'peer joined', handler: peerJoinedHandler});
  const peerLeftHandler = (peer) => console.log('peer ' + peer + ' left townhall room');
  messageHandlers.push({message: 'peer left', handler: peerLeftHandler});
  messageHandlers.push({message: 'peer joined', handler: (peer) => room.sendTo(peer, 'Hello ' + peer + ' welcome join the townhall Room!')});
  messageHandlers.push({message:'subscribed', handler: (m) => {console.log("...... subscribe towhall....", m)}});
  messageHandlers.push({
    message: 'message',
    handler: (m)=>townHallMessageHandler(m, ipfs, room, globalState)
  });
  return messageHandlers;
};

const blockRoomHandlers = (ipfs, room, options) => {
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

    const options = {};//default placeholder
    const rooms = {};
    rooms.taskRoom = roomMessageHandler(ipfs, 'taskRoom', options, taskRoomHandlers);
    rooms.townHall = roomMessageHandler(ipfs, 'townHall', {globalState}, townHallHandlers);
    rooms.blockRoom = roomMessageHandler(ipfs, 'blockRoom', options, blockRoomHandlers);
    return rooms;
  }
};