import roomMessageHandler from '../simulator/roomMeesageHandler';
import townHallMessageHandler from './townHallMessageHandler';
import {presetUsers} from '../constValue';


const createGenesysBlock = (ipfs)=>{
  console.log("**** Generating Genesis Block **** In our demo, we assume everytime we start the system we will start from the very beginning...")
  const block = {};
  block.txsPool = [];
  block.gasMap = {};
  block.creditMap = {};
  let totalGas = 0;
  let totalCredit = 0;
  for(let i = 0; i < presetUsers.length; i ++){
    const u = presetUsers[i];
    block.gasMap[u.name] = i * 100 + 20; //we add 20 to make sure User#0 still have 20 gas in his account;
    totalGas += block.gasMap[u.name];
    block.creditMap[u.name] = i * 100; // we do not add 20, so that User#0 will have money to pay for RA, but he doesn't have credit, that means he is not trustable yet
    totalCredit += block.creditMap[u.name];
  }
  block.totalGas = totalGas;
  block.totalCredit = totalCredit;
  block.latestBlockHeight = 0;
  return block;

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
    globalState.block = createGenesysBlock(ipfs);
    const options = {};//default placeholder
    const rooms = {};
    rooms.taskRoom = roomMessageHandler(ipfs, 'taskRoom', options, taskRoomHandlers);
    rooms.townHall = roomMessageHandler(ipfs, 'townHall', {globalState}, townHallHandlers);
    rooms.blockRoom = roomMessageHandler(ipfs, 'blockRoom', options, blockRoomHandlers);
    return rooms;
  }
};