const IPFS = require('ipfs');
const Room = require('ipfs-pubsub-room');
const PeerId = require('peer-id');;

let ipfs = null;
const F = {
  createIPFS(cb){
    window.IPFS = IPFS;
    
    IPFS.create({
      repo: 'ipfs-leo/poc/' + Math.random(),
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
    }).then((ipfs)=>{
      console.log('IPFS node is ready');
      // window.ipfs = ipfs;
      ipfs.on('error', error=>{
        console.log('IPFS on error:', error);
      });
    
      ipfs.on('init', error=>{
        console.log('IPFS on init:', error);
      });
      
     
      // roomMessageHandler(ipfs, 'taskRoom', taskRoom);
      // roomMessageHandler(ipfs, 'townHall', townHall);
      // window.blockRoom = roomMessageHandler(ipfs, 'blockRoom', blockRoom);
      cb(ipfs);
    });
  }
};

F.room = {
  resiger(roomName, messageHandler){
    if(!ipfs){
      console.error('ipfs not initialize.')
      return false;
    }

    const room = Room(ipfs, roomName);
    const handlers = messageHandler(ipfs, room);
    handlers.map ((m)=>{
      room.on(m.message, m.handler);
    });
    
    return room;
  }
};

module.exports = F;