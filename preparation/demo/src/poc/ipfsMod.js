const IPFS = require('ipfs');
import {townHall, taskRoom, blockRoom, roomMessageHandler} from './simulator'

exports.ipfsStart = async (app)=>{
  const ipfs = await IPFS.create({
    repo: 'ipfs-storage-no-git/poc/' + Math.random(),
    EXPERIMENTAL: {
      pubsub: true
    },
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
  return ipfs;
};


exports.ipfsPubSubInit = async (ipfs)=>{
  const pubsubRooms = {};
  pubsubRooms.taskRoom = roomMessageHandler(ipfs, 'taskRoom', taskRoom);
  pubsubRooms.townHall = roomMessageHandler(ipfs, 'townHall', townHall);
  pubsubRooms.blockRoom = roomMessageHandler(ipfs, 'blockRoom', blockRoom);
  console.log("pubsubRoom is ready");
  
  return pubsubRooms;
}