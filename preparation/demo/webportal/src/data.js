const _ = require('lodash');

const Data = class {
  constructor(myIpfs){
    this.myIpfs = myIpfs;

    this.peer_list = [];
    this.peer_map = {};

    this.block_list = [];
    this.block = null;
  }


  addPeer(peer){
    console.log('add peer => ', peer);
    this.peer_list.push(peer);
    this.peer_map[peer.name] = peer;
  }

  addBlock(block){
    console.log('add block => ', block);
    this.block_list.push(block);
    this.block = block;

    this.refreshPeerList();
  }
  getCurrentBlock(){
    return this.block ? this.block.value : null;
  }
  refreshPeerList(){
    this.peer_list = _.map(this.peer_list, (item)=>{
      item.profile = this.getProfile(item.name);
      this.peer_map[item.name] = item;
      return item;
    });
  }

  getProfile(name){
    const block = this.getCurrentBlock();
    return {
      location : block.peerProfile[name].loc,
      peerId : name,
      gas : block.gasMap[name],
      creditScore : block.creditMap[name]
    };
  }

  getAllListForChart(){
    return _.map(this.peer_list, (item)=>{
      return item.profile
    });
  }

  

};



module.exports = Data;