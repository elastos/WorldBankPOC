const PEERID_RESERVE = '0';
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../api/utils/APIError');
const txLogSchema = require('./txLogSchema');

/**
 * Credit Schema
 * @private
 */
const creditSchema = new mongoose.Schema({
  peerId: {
    type: String, //For PoC, we use String instead of hash256 for easier human reading.
    //Of course, it is not efficient. We will change later in product
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },

  creditScore: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
// creditSchema.pre('save', async save(next) => {
//   //we will put pre conditional later
// });

/**
 * Methods
 */
creditSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'name', 'creditScore', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
creditSchema.statics = {


  /**
   * Get creditScore
   *
   * @param {peerId} id - The peerId.
   * @returns {Promise<CreditScore, APIError>}
   */
  async get(peerId) {
      return credit = await this.findOne({peerId}).exec();
  },

  async set(peerId, score){
    const n = Number.parseInt(score);
  
    credit = await this.findOne({peerId}).exec();
    if(credit){
      console.log('l82', credit);
      credit.creditScore = n;
      return credit.save();
    }else{
      console.log('l86', credit);
      return await this.create({
        peerId, 
        creditScore: n
      })
    }

  },
  async transferCreditBalanced(fromPeerId, toPeerId, amt, referenceEventType, referenceEventId){

    //TODO: We now allow a peer credit score lower than 0. but in the futuer we will reject
    this.findOneAndUpdate({peerId:fromPeerId}, {$inc:{creditScore: - amt}}).exec();
    this.findOneAndUpdate({peerId:toPeerId}, {$inc: {creditScore: amt}}).exec();
    return await txLogSchema.addNewTxLog({
      fromPeerId,
      toPeerId,
      amt,
      tokenType:'credit',
      referenceEventType, 
      referenceEventId
    })

  },
  
  async depositToReserve(fromPeerId, amt, referenceEventType, referenceEventId){
    return this.transferCreditBalanced(fromPeerId, PEERID_RESERVE, amt, referenceEventType, referenceEventId);
  },
  
  async withdrawFromReserve(toPeerId, amt, referenceEventType, referenceEventId){
    return this.transferCreditBalanced(PEERID_RESERVE, toPeerId, amt, referenceEventType, referenceEventId);
  },
};

/**
 * @typedef Credit
 */
module.exports = mongoose.model('Credit', creditSchema);
