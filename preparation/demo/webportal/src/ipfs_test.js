const MyIpfs = require('../../src/shared/MyIpfs');
const IPFS = require('ipfs');
const PeerId = require('peer-id');
const EChart = require('./echart');
const Data = require('./data');
import {tryParseJson} from '../../src/poc/constValue';

let _n = 1;
const log = (str)=>{
  str = `[${_n}] => `+str;
  const html = MyIpfs.log(str);
  $('.js_html').prepend(html);
  _n++;
}

const C = {
  blockRoom : 'blockRoom',
  taskRoom : 'taskRoom',
  townHall : 'townHall',
  user : null
};

let myIpfs = null;
let myChart = null;
let myData = null;
let blockRoom, taskRoom, townHall;
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
    const params = util.getUrlParam();
    C.user = {
      name : params.u,
      pub : params.pub,
      pri : params.pri
    };
    C.blockRoom = 'blockRoom'+params.r;
    C.taskRoom = 'taskRoom'+params.r;
    C.townHall = 'townHall'+params.r;

    myIpfs = new MyIpfs();
    myChart = new EChart($('#echart-div')[0], {
      click(d){
        console.log(d);
      }
    });
    myData = new Data(myIpfs);
    window.myData = myData;

    await myIpfs.start();
    window.myIpfs = myIpfs;

    F.initBlockRoom();

    myChart.render();
  },

  initTaskRoom(){},
  initBlockRoom(){
    blockRoom = myIpfs.registerRoom(C.blockRoom, {
      join(peer){
        log('peer ' + peer + ' joined block room');

        F.processNewJoinPeer(peer);

      },
      left(peer){
        log('peer ' + peer + ' left room');
      },
      subscribe(m){
        log("...... subscribe.... => "+m);
        
        F.publishSelfId()
      },
      message(msg){
        log('block room got message from ' + msg.from + ': ' + msg.data.toString())

        F.processMessage(msg);
      }
    });

    window.blockRoom = blockRoom;
  },
  initTownHall(){},

  async publishSelfId(){
    const obj = await myIpfs.node.id();

    _.delay(async ()=>{
      await $.ajax({
        url : '/poc/update_ipfs_id', 
        data : {
          user : encodeURIComponent(C.user.name),
          ipfs_id : obj.id
        },
        type : 'get'
      });

      myData.addPeer({
        name : C.user.name,
        pub : C.user.pub,
        pri : C.user.pri,
        ipfs_id : obj.id
      });
    }, 100);
  },

  processNewJoinPeer(ipfs_id){
    $.ajax({
      url : '/poc/get_user_by_ipfs',
      type : 'get',
      data : {
        ipfs_id
      }
    }).then((rs)=>{
      const user = rs.data;
      if(!user){
        return false;
      }

      myData.addPeer(user);
    })
  },

  async processMessage(message){
    const blockObj = tryParseJson(message.data);

    if(typeof blockObj === 'undefined'){
      return log('In block room got an non-parsable message from ' + message.from + ': ' + message.data.toString());
    }
    const {txType, cid} = blockObj;
    if(txType === 'newBlock'){
      const block = await myIpfs.node.dag.get(cid);
      console.log("received block:", block);
      // if(options.isProcessingBlock){
      //   throw new exceptions("Racing conditions found. Some async funciton is processing block while new block just came in, how to handle this issue?");
      // }
      
      myData.addBlock(block);

      log('receive new block, refresh data.');
      console.log(11, myData.getAllListForChart());
      const list = myData.getAllListForChart();
      myChart.render(list);
      return true;
    }
    
    return log('In block room got an unhandled message from ' + message.from + ': ' + message.data.toString());
  }

};


window.poc = {


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