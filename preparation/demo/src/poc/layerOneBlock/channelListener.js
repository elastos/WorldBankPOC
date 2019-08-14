import townHallMessageHandler from './townHallMessageHandler';
import taskRoomMessageHandler from './taskRoomMessageHandler';
import blockRoomMessageHandler from './blockRoomMessageHandler';

import {presetUsers} from '../constValue';
import Room from 'ipfs-pubsub-room';


const createGenesysBlock = (ipfs)=>{
  console.log("**** Generating Genesis Block **** In our demo, we assume everytime we start the system we will start from the very beginning...")
  const block = {};

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


exports.channelListener = (ipfs)=>{
  //We assume every time we start the demo, it starts from genesis block
  const globalState = {};
  globalState.txPool = [];
  globalState.block = createGenesysBlock(ipfs);
  const options = {globalState};//default placeholder
  const rooms = {};
  const taskRoom = Room(ipfs, 'taskRoom');
  taskRoom.on('peer joined', (peer)=>peer);//console.log(console.log('peer ' + peer + ' joined task room')));
  taskRoom.on('peer left', peer=>peer);//console.log('peer ' + peer + ' left task room'));
  taskRoom.on('subscribed', (m) => console.log("...... subscribe task room....", m));
  taskRoom.on('message', taskRoomMessageHandler(ipfs, rooms.taskRoom, options));

  
  const townHall = Room(ipfs, 'townHall');
  townHall.on('peer joined', (peer)=>peer);//console.log(console.log('peer ' + peer + ' joined task room')));
  townHall.on('peer left', peer=>peer);//console.log('peer ' + peer + ' left task room'));
  townHall.on('subscribed', (m) => console.log("...... subscribe task room....", m));
  townHall.on('message', townHallMessageHandler(ipfs, rooms.townHall, options));

  const blockRoom = Room(ipfs, 'blockRoom');
  blockRoom.on('peer joined', (peer)=>peer);//console.log(console.log('peer ' + peer + ' joined task room')));
  blockRoom.on('peer left', peer=>peer);//console.log('peer ' + peer + ' left task room'));
  blockRoom.on('subscribed', (m) => console.log("...... subscribe task room....", m));
  blockRoom.on('message', blockRoomMessageHandler(ipfs, rooms.blockRoom, options));

  return {taskRoom, townHall, blockRoom};
}
