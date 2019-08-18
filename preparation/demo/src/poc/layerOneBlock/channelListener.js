import townHallMessageHandler from './townHallMessageHandler';
import taskRoomMessageHandler from './taskRoomMessageHandler';
import blockRoomMessageHandler from './blockRoomMessageHandler';
import Room from 'ipfs-pubsub-room';
import townHallJoinLeftHandler from './townHallJoinLeftHandler';

const createRandomGeoLocation = (n)=>{
  var data=[];   
  for (var i=0; i < n; i++) {
    var aaa = GetRandomNum(-179,179)+Math.random();
    var bbb = GetRandomNum(-40,89)+Math.random();
    data.push([aaa, bbb]);
  }
  function GetRandomNum(Min,Max){   
    var Range = Max - Min;   
    var Rand = Math.random();   
    return(Min + Math.round(Rand * Range));   
  } 
  return data;
};


const createGenesysBlock = (ipfs, presetUsers)=>{
  console.log("**** Generating Genesis Block **** In our demo, we assume everytime we start the system we will start from the very beginning...")
  const block = {};
  block.gasMap = {};
  block.creditMap = {};
  block.peerProfile = {};
  let totalGas = 0;
  let totalCredit = 0;

  const locs = createRandomGeoLocation(presetUsers.length);
  for(let i = 0; i < presetUsers.length; i ++){
    const u = presetUsers[i];
    block.gasMap[u.name] = i < 10? i * 10 : 50;
    totalGas += block.gasMap[u.name];
    block.creditMap[u.name] = i < 10? i: 50; //
    totalCredit += block.creditMap[u.name];
    block.peerProfile[u.name] = {
      loc : locs[i]
    };
  }
  block.previousBlockHeight = -1;//this is a special case for genesis block, it is -1;
  block.totalGas = totalGas;
  block.totalCredit = totalCredit;
  block.processedTxs = [],
  block.latestBlockHeight = 0;
  block.trustedPeerToUserInfo = {};//trustedPeers mean those node with more than 0 credit. We record a map between this node's IPFS id, and VRF public key(AKA userName mapped public key)
  block.totalCreditForOnlineNodes = 0,
  block.escrowGasMap = {},
  block.pendingTasks = {}
  return block;

}


exports.channelListener = (ipfs, randRoomPostfix, presetUsers)=>{
  
  //We assume every time we start the demo, it starts from genesis block
  const globalState = createGenesysBlock(ipfs, presetUsers);
  const options = {globalState};//default placeholder
  const rooms = {};
  const taskRoom = Room(ipfs, 'taskRoom' + randRoomPostfix, {pollInterval:333});
  taskRoom.on('peer joined', (peer)=>peer);//console.log(console.log('peer ' + peer + ' joined task room')));
  taskRoom.on('peer left', peer=>peer);//console.log('peer ' + peer + ' left task room'));
  taskRoom.on('subscribed', (m) => console.log("...... subscribe task room....", m));
  taskRoom.on('message', taskRoomMessageHandler(ipfs, rooms.taskRoom, options));

  
  const townHall = Room(ipfs, 'townHall' + randRoomPostfix, {pollInterval:250});
  townHall.on('peer joined', townHallJoinLeftHandler.join(ipfs, townHall, options));
  townHall.on('peer left', townHallJoinLeftHandler.left(ipfs, townHall, options));
  townHall.on('subscribed', (m) => console.log("...... subscribe task room....", m));
  townHall.on('message', townHallMessageHandler(ipfs, rooms.townHall, options));

  const blockRoom = Room(ipfs, 'blockRoom' + randRoomPostfix, {pollInterval:333});
  blockRoom.on('peer joined', (peer)=>peer);//console.log(console.log('peer ' + peer + ' joined task room')));
  blockRoom.on('peer left', peer=>peer);//console.log('peer ' + peer + ' left task room'));
  blockRoom.on('subscribed', (m) => console.log("...... subscribe task room....", m));
  blockRoom.on('message', blockRoomMessageHandler(ipfs, rooms.blockRoom, options));

  return {ipfs, globalState, pubsubRooms:{taskRoom, townHall, blockRoom}};
}
