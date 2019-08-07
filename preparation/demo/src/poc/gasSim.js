const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../api/utils/APIError');
const txLogSchema = require('./txLogSchema');
const constValue = require('./constValue');
/**
 * Credit Schema
 * @private
 */
const gasSchema = new mongoose.Schema({
  peerId: {
    type: String, 
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },

  gasBalance: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});


gasSchema.method({
  // transform() {
  //   const transformed = {};
  //   const fields = ['id', 'name', 'creditScore', 'createdAt'];

  //   fields.forEach((field) => {
  //     transformed[field] = this[field];
  //   });

  //   return transformed;
  // },
});

/**
 * Statics
 */
gasSchema.statics = {
  async get(peerId) {
      return credit = await this.findOne({peerId}).exec();
  },

  async set(peerId, gas){
    const n = Number.parseInt(gas);
  
    gas = await this.findOne({peerId}).exec();
    if(gas){
      gas.gasBalance = n;
      return gas.save();
    }else{
      return await this.create({
        peerId, 
        gas: n
      })
    }

  },
  async transferGas(fromPeerId, toPeerId, amt, referenceEventType, referenceEventId){
    if(fromPeerId != constValue.gasFaucetPeerId){
      const fromPeer =await this.findOne({peerId:fromPeerId}).exec();
      if(! fromPeer) return {txId: null, err:'From Peer Not Exists'};
      console.log('fromPeer', fromPeer, amt);
      const newBalance = fromPeer.gasBalance - amt;

      if(newBalance < 0) return {txId: null, err:'From Peer Doesnot have enough balance'};
      await this.findOneAndUpdate({peerId:fromPeerId}, {$inc:{gasBalance:newBalance}}).exec();
    }
    let toPeer;
    if(toPeerId != constValue.gasBurnPeerId){
      toPeer = await this.findOne({peerId:toPeerId}).exec();
      if(! toPeer){
        toPeer = await this.create({peerId:toPeerId, gasBalance:0})
      }
    }

    const newToPeerBalance = toPeer? toPeer.gasBalance + amt: amt;
    await this.findOneAndUpdate({peerId:toPeerId}, {$inc:{gasBalance:newToPeerBalance}}).exec();
    //During placeholder stage, we do not guarantee transaction and atom transaction, we assume all transaction go through successfully
    return await txLogSchema.addNewTxLog({
      fromPeerId,
      toPeerId,
      amt,
      tokenType:'gas',
      referenceEventType, 
      referenceEventId
    })

  },

  async transferGasToEscrow(fromPeerId, amt, referenceEventType, referenceEventId){
    return this.transferGas(fromPeerId, constValue.gasBurnPeerId, amt, referenceEventType, referenceEventId);
  },

  async transferGasFromEscrow(toPeerId, amt, referenceEventType, referenceEventId){
    return this.transferGas(constValue.gasFaucetPeerId, toPeerId, amt, referenceEventType, referenceEventId);
  },
};


module.exports = mongoose.model('Gas', gasSchema);

