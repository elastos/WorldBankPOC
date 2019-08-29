import IPFS from 'ipfs';
import {getUrlVars} from './utils.js';
import {main } from './simulator';
import Room from 'ipfs-pubsub-room';

function init(){
  //const peer = await PeerId.createFromJSON(demoPeerKeys[0]);
  const swarmUrl = getUrlVars().s;
  console.log('swarmUrl:|', swarmUrl, '|');
  window.IPFS = IPFS;
  IPFS.create({
    repo: 'ipfs-leo/poc/' + Math.random(),
    EXPERIMENTAL: {
      pubsub: true
    },
    // init:{
    //   privateKey:peer
    // },
    config: {
      Addresses: {
        Swarm: [
          //'/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
          //'/dns4/127.0.0.1/tcp/9090/wss/p2p-websocket-star'
          //'/ip4/127.0.0.1/tcp/9090/ws/p2p-websocket-star'
          swarmUrl
        ]
      }
    }
  }).then((ipfs)=>{
    console.log('IPFS node is ready');
    window.ipfs = ipfs;
    ipfs.on('error', error=>{
      console.log('IPFS on error:', error);
    });
  
    ipfs.on('init', error=>{
      console.log('IPFS on init:', error);
    });

    const userName = getUrlVars().u;
    const randRoomPostfix = getUrlVars().r || "";
    const publicKey = getUrlVars().pub || "";
    const privateKey = getUrlVars().pri || "";
    const ipfsPeerId = ipfs._peerInfo.id.toB58String();
    const userInfo = {userName, randRoomPostfix, publicKey, privateKey, ipfsPeerId}
    
    console.log("randRoomPostfix", randRoomPostfix);
    const rooms = {};
    
    const options = {ipfs, rooms, userInfo};
    rooms.taskRoom = Room(ipfs, 'taskRoom'+ randRoomPostfix);//roomMessageHandler(ipfs, 'taskRoom' + randRoomPostfix, options, taskRoom);
    rooms.townHall = Room(ipfs, 'townHall'+ randRoomPostfix);//roomMessageHandler(ipfs, 'townHall' + randRoomPostfix, options, townHall);
    rooms.blockRoom = Room(ipfs, 'blockRoom'+ randRoomPostfix);//roomMessageHandler(ipfs, 'blockRoom' + randRoomPostfix, options, blockRoom);
    window.rooms = rooms;
  });
  

};


