const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../api/utils/APIError');
const _ = require('lodash');

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
  tokenType:{
    type:String,//We only allow "gas" or "credit"
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
    if(_.isString(id)){
      id = mongoose.Types.ObjectId(id);
    }
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
  async doValidationOnGasTx(txId, validateFunction){

    const tx = await this.findOne({_id:txId}).exec();
    if(! tx) return false;
    return validateFunction(tx);
  },
  async getAllByPeerId(peerId){
    const list = await this.find({
      $or: [
        {
          fromPeerId : peerId
        },
        {
          toPeerId : peerId
        }
      ]
    }).sort({updatedAt : -1}).exec();

    return list;
  }
};

module.exports = mongoose.model('TxLog', txLogSchema);
