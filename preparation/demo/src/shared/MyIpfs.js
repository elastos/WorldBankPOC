const IPFS = require('ipfs');
const Room = require('ipfs-pubsub-room');
const PeerId = require('peer-id');
const _ = require('lodash');

const MyIpfs = class  {

  constructor(peerConfig){
    this.peer = peerConfig;
    if(!this.peer){
      throw 'invalid index';
    }
    this.room_map = {};

    this.config = {
      repo: 'ipfs-leo/poc/' + this.peer.id,
      EXPERIMENTAL: {
        pubsub: true
      },
      init: {
        privateKey : this.peer.privKey
      },
      config: {
        Addresses: {
          Swarm: [
            '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
          ]
        }
      }
    };
  }

  async start(){
    this.node = await IPFS.create(this.config);
    this.node.on('error', error=>{
      console.log('IPFS on error:', error);
    });
  
    this.node.on('init', error=>{
      console.log('IPFS on init:', error);
    });

    return this.node;
  }

  registerRoom(roomName, cbs){
    const room = Room(this.node, roomName);
    this.room_map[roomName] = room;
    room.on('peer joined', cbs.join);
    room.on('peer left', cbs.left);
    room.on('subscribed', cbs.subscribe);
    room.on('message', cbs.message);
    
    return room;
  }

  getRoomByName(roomName){
    return this.room_map[roomName];
  }

  broadcast(roomName, msg){
    const room = this.getRoomByName(roomName);
    room.broadcast(msg);
  }

  getRoomPeers(roomName){
    const room = this.getRoomByName(roomName);
    return room.getPeers();
  }


};

MyIpfs.log = (...str)=>{
  console.log(...str);
  return '<div style="font-size:13px;">'+str.join(' - ')+'</div>';
}

module.exports = MyIpfs;