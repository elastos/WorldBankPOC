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
    unique: false,
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
  creditScoreAtBlockHeightTime:{
    type:Number,
    required: true,
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
  async addNewRaLog({peerId, potHash, pi, vrfHash, blockHeight, creditScoreAtBlockHeightTime, raResult}){
    const newRaLog = {peerId, potHash, pi, vrfHash, blockHeight, creditScoreAtBlockHeightTime, raResult, finalized: false};
    return this.create(newRaLog);
  },
  async finalizeRaLogs(idArray){
    return await Promise.all(idArray.map(id => {
      const query= {_id:id};
      return this.findOneAndUpdate(query, {finalized:true});
    }));
  },
};

module.exports = mongoose.model('RaLog', raLogSchema);
