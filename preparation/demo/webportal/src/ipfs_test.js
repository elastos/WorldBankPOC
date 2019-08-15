const MyIpfs = require('../../src/shared/MyIpfs');
const IPFS = require('ipfs');
const PeerId = require('peer-id');
const EChart = require('./echart');
const Data = require('./data');

const log = (str)=>{
  const html = MyIpfs.log(str);
  $('.js_html').append(html);
}

const C = {
  room : 'POC-Room'
};

let myIpfs = null;
let myChart = null;
let myData = null;
const F = {
  loading(f=false){
    if(f){
      $.fakeLoader({
        timeToHide : 999999,
        bgColor : 'rgba(0,0,0,0.7)'
      });
    }
    else{
      $('.fakeLoader').hide();
    }
  },
  async init(){
    const index = this.getUrlParam();
    const peerConfig = Data.getPeerJson(index);
    log(JSON.stringify(peerConfig));
    myIpfs = new MyIpfs(peerConfig);
    myChart = new EChart($('#echart-div')[0], {
      click(d){
        console.log(d);
      }
    });
    myData = new Data(myIpfs);

    

    await myIpfs.start();
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
    myChart.render();
  },

  getUrlParam(){
    return parseInt(location.search.replace('?', ''), 10);;
  }
};


window.poc = {

  broadcast(msg){
    myIpfs.broadcast(C.room, msg);
  },

  getPeers(){
    const list = myIpfs.getRoomPeers(C.room);
    log(list);
  }
};

$(async ()=>{
  F.loading(true);
  await F.init();
  F.loading(false);
})