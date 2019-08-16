const IPFS = require('ipfs')
const roomMessageHandler = require('./roomMeesageHandler');

const townHall = require('./townHall');
const taskRoom = require('./taskRoom');
const blockRoom = require('./blockRoom');
import {getUrlVars} from './utils.js';
import {main } from './simulator';

function init(){
  //const peer = await PeerId.createFromJSON(demoPeerKeys[0]);


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
          '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
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
    const pubicKey = getUrlVars().pub || "";
    const privateKey = getUrlVars().pri || "";
    const userInfo = {userName, randRoomPostfix, pubicKey, privateKey}
    ipfs.id((id)=>{
      console.log("randRoomPostfix", randRoomPostfix);
      const rooms = {};
      const options = {ipfs, rooms, userInfo, ipfsId:id};
      rooms.taskRoom = roomMessageHandler(ipfs, 'taskRoom' + randRoomPostfix, options, taskRoom);
      rooms.towHall = roomMessageHandler(ipfs, 'townHall' + randRoomPostfix, options, townHall);
      rooms.blockRoom = roomMessageHandler(ipfs, 'blockRoom' + randRoomPostfix, options, blockRoom);
      window.rooms = rooms;
      main({ipfsId: id, userInfo});
    })
    
  });
  

};


document.addEventListener('DOMContentLoaded', init);