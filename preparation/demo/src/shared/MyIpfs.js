const IPFS = require('ipfs');
const Room = require('ipfs-pubsub-room');
const _ = require('lodash');

const MyIpfs = class  {

  constructor(ipfs_url){

    this.room_map = {};
    this.config = {
      repo: 'ipfs-leo/poc/' + Math.random(),
      EXPERIMENTAL: {
        pubsub: true
      },
      // init: {
      //   privateKey : this.peer.privKey
      // },
      config: {
        Addresses: {
          Swarm: [
            // '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
            ipfs_url
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
  return '<div style="font-size:12px;word-break:break-all;width:100%;margin-bottom:8px;">'+str.join(' - ')+'</div>';
}

module.exports = MyIpfs;