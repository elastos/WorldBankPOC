const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../api/utils/APIError');


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

  }
};

/**
 * @typedef Credit
 */
module.exports = mongoose.model('Credit', creditSchema);
