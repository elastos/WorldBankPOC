const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../api/utils/APIError');
const txLogSchema = require('./txLogSchema');

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
    const fromPeer = this.findOne({fromPeerId}).exec();
    if(! fromPeer) return {txId: null, err:'From Peer Not Exists'};
    const newBalance = fromPeer.gasBalance - amt;
    if(newBalance < 0) return {txId: null, err:'From Peer Doesnot have enough balance'};
    this.findOneAndUpdate({peerId:fromPeerId}, {gasBalance:newBalance}).exec();

    const toPeer = this.findOne({toPeerId}).exec();
    if(! toPeer) return {txId: null, err:'To Peer Not Exists'};
    const newToPeerBalance = toPeer.gasBalance + amt;
    this.findOneAndUpdate({peerId:toPeerId}, {gasBalance:newToPeerBalance}).exec();
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
};


module.exports = mongoose.model('Gas', gasSchema);

