const _ = require('lodash');

const Data = class {
  constructor(myIpfs){
    this.myIpfs = myIpfs;

    this.me = {};

    this.peer_list = [];
    this.peer_map = {};

    this.block_list = [];
    this.block = null;
  }


  setMyPeer(peer){
    this.me = peer;
    this.peer_map[peer.name] = peer;
  }

  removePeerById(id){
    _.remove(this.peer_list, (item)=>{
      return item.name === id;
    });
    delete this.peer_map[id];
  }
  removePeerByIpfsId(ipfs_id){
    const tmp = _.find(this.peer_list, (item)=>{
      return item.ipfs_id === ipfs_id;
    });
    if(tmp){
      this.removePeerById(tmp.name);
    }
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
    const block = this.getCurrentBlock();
    const list = [];
    _.each(block.trustedPeerToUserInfo, (val, ipfs_id)=>{
      list.push({
        name: val.userName,
        ipfs_id
      })
    });
    const peer_list = list;  //_.concat(this.me, list);
    this.peer_list = _.map(peer_list, (item)=>{
      item.profile = this.getProfile(item.name);
      item.profile.ipfs_id = item.ipfs_id;
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