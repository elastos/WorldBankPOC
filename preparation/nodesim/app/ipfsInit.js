import IPFS  from 'ipfs';
import Room from 'ipfs-pubsub-room';
import {o} from './utilities';
import townHallHandler from './townHallHandler.js';

exports.ipfsInit = async (swarmUrlOption)=>{
  console.log('swarmUrlOption:|', swarmUrlOption, '|');
  const swarmUrl = swarmUrlOption == 'local'? '/ip4/127.0.0.1/tcp/9090/ws/p2p-websocket-star': swarmUrlOption;
  
  console.log('swarmUrl:|', swarmUrl, '|');
  const ipfs = await IPFS.create({
    repo: 'ipfs-leo/poc/' + Math.random(),
    EXPERIMENTAL: {
      pubsub: true
    },
    config: {
      Addresses: {
        Swarm: [
          swarmUrl
        ]
      }
    }
  });
  console.log('IPFS node is ready');
  ipfs.on('error', error=>{
    o('log', 'IPFS on error:', error);
  });

  ipfs.on('init', error=>{
    o('log', 'IPFS on init:', error);
  });
  return ipfs;
    // const userName = getUrlVars().u;
    // const randRoomPostfix = getUrlVars().r || "";
    // const publicKey = getUrlVars().pub || "";
    // const privateKey = getUrlVars().pri || "";
    // const ipfsPeerId = ipfs._peerInfo.id.toB58String();
    // const userInfo = {userName, randRoomPostfix, publicKey, privateKey, ipfsPeerId}
    
    // console.log("randRoomPostfix", randRoomPostfix);
    // const rooms = {};
    
    // const options = {ipfs, rooms, userInfo};
    // rooms.taskRoom = roomMessageHandler(ipfs, 'taskRoom' + randRoomPostfix, options, taskRoom);
    // rooms.townHall = roomMessageHandler(ipfs, 'townHall' + randRoomPostfix, Object.assign({},options), townHall);
    // rooms.blockRoom = roomMessageHandler(ipfs, 'blockRoom' + randRoomPostfix, options, blockRoom);
    // window.rooms = rooms;
    
    // main({userInfo, ipfs, rooms});
  
    
}

exports.pubsubInit = async (ipfs, roomNamePostfix)=>{
  const townHall = Room(ipfs, "townHall" + roomNamePostfix);
  townHall.on('peer joined', townHallHandler.peerJoined);
  townHall.on('peer left', townHallHandler.peerLeft);
  townHall.on('subscribed', townHallHandler.subscribed);
  townHall.on('rpcDirect', townHallHandler.rpcDirect(townHall));
  //const taskRoom = Room(ipfs, 'taskRoom' + roomNamePostfix);
  //const blockRoom = Room(ipfs, 'blockRoom' + roomNamePostfix);
  return {townHall}

}