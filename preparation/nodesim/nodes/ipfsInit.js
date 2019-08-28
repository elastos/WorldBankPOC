import IPFS  from 'ipfs';
import Room from 'ipfs-pubsub-room';
import {o} from '../shared/utilities';
import townHallHandler from './townHallHandler';
import blockRoomHandler from './blockRoomHandler';

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
  // ipfs.on('error', error=>{
  //   o('log', 'IPFS on error:', error);
  // });

  // ipfs.on('init', error=>{
  //   o('log', 'IPFS on init:', error);
  // });
  return ipfs;
}

exports.pubsubInit = async (ipfs, roomNamePostfix, rpcEvent, broadcastEvent)=>{

  const townHall = Room(ipfs, "townHall" + roomNamePostfix);
  townHall.on('peer joined', townHallHandler.peerJoined);
  townHall.on('peer left', townHallHandler.peerLeft);
  townHall.on('subscribed', townHallHandler.subscribed);
  townHall.on('rpcDirect', townHallHandler.rpcDirect(townHall));

  const taskRoom = Room(ipfs, 'taskRoom' + roomNamePostfix);
  taskRoom.on('subscribed', m=>o('log', 'subscribed', m));
  
  const blockRoom = Room(ipfs, 'blockRoom' + roomNamePostfix);
  blockRoom.on('message', blockRoomHandler.messageHandler(ipfs))

  rpcEvent.on("rpcRequest", townHallHandler.rpcRequest(townHall));
  rpcEvent.on("rpcResponseWithNewRequest", townHallHandler.rpcResponseWithNewRequest(townHall));
  rpcEvent.on("rpcResponse", townHallHandler.rpcResponse(townHall));
  if(broadcastEvent){
    broadcastEvent.on('taskRoom', (m)=>taskRoom.broadcast(m));
    broadcastEvent.on('blockRoom', (m)=>blockRoom.broadcast(m));  
  }
  
  return {townHall}

}