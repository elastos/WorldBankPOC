const IPFS = require('ipfs')
const Room = require('ipfs-pubsub-room')
const PeerId = require('peer-id');
const {demoPeerKeys} = require('../demoPeerIdKeys');
let ipfs;
function repo () {
  return 'ipfs-leo/poc/' + Math.random()
}
async function main(){
  //const peer = await PeerId.createFromJSON(demoPeerKeys[0]);

  ipfs = new IPFS({
    repo: repo(),
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

  ipfs.once('ready', () => ipfs.id((err, info) => {
    if (err) { throw err }
    console.log('IPFS node ready with address ' + info.id)

    const room = Room(ipfs, 'townhall')

    room.on('peer joined', (peer) => console.log('peer ' + peer + ' joined'))
    room.on('peer left', (peer) => console.log('peer ' + peer + ' left'))

    // send and receive messages

    room.on('peer joined', (peer) => room.sendTo(peer, 'Hello ' + peer + '!'))
    room.on('message', (message) => console.log('got message from ' + message.from + ': ' + message.data.toString()))


    room.on('subscribed',(m) => {
      console.log("...... subscribe....", m);
    });

    const taskRoom = Room(ipfs, 'poc-task-room');
    const blockRoom = Room(ipfs, 'poc-block-room');
    const testRoom = Room(ipfs, 'poc-test-roo ');


      


      // broadcast message every 2 seconds

      //setInterval(() => room.broadcast('hey everyone!'), 2000)
  }));
  ipfs.on('error', error=>{
    console.log('IPFS on error:', error);
  });

  ipfs.on('init', error=>{
    console.log('IPFS on init:', error);
  });


  window.peerId = PeerId;
  window.ipfs = ipfs;

};
document.addEventListener('DOMContentLoaded', main);