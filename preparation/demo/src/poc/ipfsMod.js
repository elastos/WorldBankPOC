const IPFS = require('ipfs')
const Room = require('ipfs-pubsub-room')
const PeerId = require('peer-id');
import {townHall, taskRoom, blockRoom, roomMessageHandler} from './simulator'

exports.ipfsStart = async (app)=>{
  //const peer = await PeerId.createFromJSON(demoPeerKeys[0]);
  console.log('before IPFS.create');
  const ipfs = await IPFS.create({
    repo: 'ipfs-storage-no-git/poc/' + Math.random(),
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
  });
  console.log('IPFS node is ready');
  ipfs.on('error', error=>{
    console.log('IPFS on error:', error);
  });

  ipfs.on('init', error=>{
    console.log('IPFS on init:', error);
  });
  // async function store () {
  //   const toStore = document.getElementById('source').value

  //   const res = await node.add(Buffer.from(toStore))

  //   res.forEach((file) => {
  //     if (file && file.hash) {
  //       console.log('successfully stored', file.hash)
  //       display(file.hash)
  //     }
  //   })
  // }

  // async function display (hash) {
  //   // buffer: true results in the returned result being a buffer rather than a stream
  //   const data = await node.cat(hash)
  //   document.getElementById('hash').innerText = hash
  //   document.getElementById('content').innerText = data
  // }

  // document.getElementById('store').onclick = store
  console.log("taskroom", taskRoom, townHall);
  const pubsubRooms = {};
  pubsubRooms.taskRoom = roomMessageHandler(ipfs, 'taskRoom', taskRoom);
  pubsubRooms.townHall = roomMessageHandler(ipfs, 'townHall', townHall);
  pubsubRooms.blockRoom = roomMessageHandler(ipfs, 'blockRoom', blockRoom);
  app.set('pubsubRooms', pubsubRooms);
};
