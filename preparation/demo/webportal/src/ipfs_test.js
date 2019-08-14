const MyIpfs = require('../../src/shared/MyIpfs');
const IPFS = require('ipfs');
const PeerId = require('peer-id');

const log = (str)=>{
  const html = MyIpfs.log(str);
  $('.js_html').append(html);
}

const C = {
  room : 'blockRoom',

};

let myIpfs = null;
window.poc = {
  async joinRoom(){

    const index = parseInt(location.search.replace('?', ''), 10);
    
    myIpfs = new MyIpfs(index);
    await myIpfs.start();
    const id = await myIpfs.node.id();
    log(JSON.stringify(id));
    window.myIpfs = myIpfs;
    const room = myIpfs.registerRoom(C.room, {
      join(peer){
        log('peer ' + peer + ' joined room');
      },
      left(peer){
        log('peer ' + peer + ' left room');
      },
      subscribe(m){
        log("...... subscribe.... => "+m);
      },
      message(msg){
        log('test_block room got message from ' + msg.from + ': ' + msg.data.toString())
      }
    });

    window._room = room;
  },

  broadcast(msg){
    myIpfs.broadcast(C.room, msg);
  },

  getPeers(){
    const list = myIpfs.getRoomPeers(C.room);
    log(list);
  }
};