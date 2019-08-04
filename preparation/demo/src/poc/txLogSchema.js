const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../api/utils/APIError');


/**
 * RaLog Schema
 * @private
 */
const txLogSchema = new mongoose.Schema({
  fromPeerId: {
    type: String,
    required: true,
    unique: false,
    trim: true,
    lowercase: true,
  },
  toPeerId: {
    type: String,
    required: true,
    unique: false,
    trim: true,
    lowercase: true,
  },
  amt: {
    type: Number,
    required: true, 
  },
  referenceEventType:{
    type:String,
    requried: true,
    index: true,
  },
  referenceEventId:{
    type: String,
    required: true, 
    index: true,
    
  }

}, {
  timestamps: true,
});

txLogSchema.statics = {
  async txByTxId(id){
    const tx = await this.findOne(id).exec();
    return tx;
  },
  async txByRefTypeId({referenceEventType, referenceEventId}){
    const tx = await this.findOne({referenceEventType, referenceEventId}).exec();
    return tx;
  },
  async addNewTxLog(tx){
    return this.create(tx);
  },
  
};

module.exports = mongoose.model('TxLog', txLogSchema);
