const IPFS = require('ipfs');
const Room = require('ipfs-pubsub-room');
const PeerId = require('peer-id');;

let _ipfs = null;
const F = {
  createIPFS(cb){
    window.IPFS = IPFS;
    console.log('before IPFS.create');

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
      _ipfs = ipfs;
      window.ipfs = ipfs;
      ipfs.on('error', error=>{
        console.log('IPFS on error:', error);
      });
    
      ipfs.on('init', error=>{
        console.log('ipfs init')
        console.log('IPFS on init:', error);
      });
      
     
      // roomMessageHandler(ipfs, 'taskRoom', taskRoom);
      // roomMessageHandler(ipfs, 'townHall', townHall);
      // window.blockRoom = roomMessageHandler(ipfs, 'blockRoom', blockRoom);
      cb(ipfs);
    });
  },

  log(str){
    console.log(str);
    return '<div style="font-size:13px;">'+str+'</div>';
  },
};

F.room = {
  register(roomName, messageHandler){
    if(!_ipfs){
      console.error('ipfs not initialize.')
      return false;
    }

    const room = Room(_ipfs, roomName);
    const handlers = messageHandler(_ipfs, room);
    handlers.map((m)=>{
      room.on(m.message, m.handler);
    });
    
    return room;
  }
};

module.exports = F;