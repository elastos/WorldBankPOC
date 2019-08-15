const IPFS = require('ipfs')
const roomMessageHandler = require('./roomMeesageHandler');
const townHall = require('./townHall');
const taskRoom = require('./taskRoom');
const blockRoom = require('./blockRoom');


function main(){
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
    //console.log("taskroom", taskRoom, townHall);
    window.ipfs = ipfs;
    ipfs.on('error', error=>{
      console.log('IPFS on error:', error);
    });
  
    ipfs.on('init', error=>{
      console.log('IPFS on init:', error);
    });

    const getUrlVars = ()=>{
      const vars = {};
      const decodedUri = decodeURI(window.location.href);
      const parts = decodedUri.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m,key,value) =>{
          vars[key] = value;
      });
      return vars;
    }
    const randRoomPostfix = getUrlVars().r || "";
    console.log("randRoomPostfix", randRoomPostfix);
    const rooms = {};
    const options = {ipfs, rooms};
    //rooms.taskRoom = roomMessageHandler(ipfs, 'taskRoom' + randRoomPostfix, options, taskRoom);
    //rooms.towHall = roomMessageHandler(ipfs, 'townHall' + randRoomPostfix, options, townHall);
    rooms.blockRoom = roomMessageHandler(ipfs, 'blockRoom' + randRoomPostfix, options, blockRoom);
    window.rooms = rooms;
  });
  

};


document.addEventListener('DOMContentLoaded', main);