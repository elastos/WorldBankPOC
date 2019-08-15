
const ids = require('../../src/shared/ids');

const Data = class {
  constructor(myIpfs){
    this.myIpfs = myIpfs;
    this.data = [];
  }

  createPeerData(id){
    const loc = util.createRandomGeoLocation();
    return {
      peerId : id,
      lat : loc[0],
      lng : loc[1],
      hacked : false
    };
  }
  async createPeerInServer(id){
    return new Promise((resolve)=>{
      const val = this.createPeerData(id);
      const amt = 10;
      $.ajax({
        url : '/poc/faucetGasToPeer',
        type : 'get',
        data : {
          json : 1,
          peerId : val.peerId,
          amt
        }
      }).then((rs)=>{
        if(rs.code < 0){
          alert(rs.error);
          return false;
        }
        return $.ajax({
          url : '/poc/newJoinNodeDeposit',
          type : 'get',
          data : {
            json : 1,
            peerId : val.peerId,
            depositGasAmt : amt
          }
        })
      }).then((rs)=>{
        if(rs.code < 0){
          alert(rs.error);
          return false;
        }
        val.json = 1;
        val.depositGasTxId = rs.data.gasTransactionId._id;
  
        return $.ajax({
          url : '/poc/newNodeJoin',
          type : 'get',
          // dataType : 'json',
          data : val
        });
      }).then((rs)=>{
        if(rs.code < 0){
          alert(rs.error);
          return false;
        }
  
        alert('create success');

        resolve(rs.data);
      });
    });
    
  }

};

Data.getPeerJson = async (index)=>{
  return ids[index];
};

module.exports = Data;