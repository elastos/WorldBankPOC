const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../api/utils/APIError');


/**
 * RaLog Schema
 * @private
 */
const raLogSchema = new mongoose.Schema({
  peerId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  raResult:{
    type:Boolean,
    required:true,

  },
  potHash:{
    type:String,
    required: true,
    index:true,
  },
  pi: {
    type: String,
    maxlength: 128,
    required: true, 
    index: false,
    trim: true,
  },
  vrfHash: {
    type: Number,
    required: true, 
  },
  threshold:{
    type:Number,
    requried: true,
  },
  blockHeight:{
    type: Number,
    required: false, //this is optional in PoC, but in real project this is mandatory. All credit value is related to the blockheight at the time of RA
    index: false,
    trim: true,
  },
  finalized:{
    type:Boolean,
    requied: true,
  }

}, {
  timestamps: true,
});

raLogSchema.statics = {
  async getAllActiveRaLogFromPotHash({potHash}){
    const pot = await this.find({potHash, finalized:false}).exec();
    return pot;
  },
  async addNewRaLog({peerId, potHash, pi, vrfHash, blockHeight, raResult}){
    const newRaLog = {peerId, potHash, pi, vrfHash, blockHeight, raResult, finalized: false};
    return this.create(newRaLog);
  },
  async finalizeRaLogs(idArray){
    return await Promise.all(idArray.map(id => {
      const raLog = this.findOne(id);
      if(raLog){
        raLog.finalized = true;
        return raLog.save();
      }
      return null;
    }));
  },
};

module.exports = mongoose.model('RaLog', raLogSchema);
