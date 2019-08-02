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

  name: {
    type: String,
    maxlength: 128,
    required: false, //this is optional
    index: true,
    trim: true,
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
    
    try {
      const credit = await this.findOne({peerId}).exec();

      if (credit) {
        return credit;
      }
      
      throw new APIError({
        message: 'Id does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  async set(peerId, score){
    console.log("set score for ,", peerId, score);
    const n = Number.parseInt(score);
  
    credit = await this.findOne({peerId}).exec();
    console.log("l107, ", credit);
    if(credit){
      credit.creditScore = n;
      console.log("line110", credit);
      return credit.save();
    }else{
      return this.create({
        peerId, 
        creditScore: score
      })
    }

  }
};

/**
 * @typedef Credit
 */
module.exports = mongoose.model('Credit', creditSchema);
