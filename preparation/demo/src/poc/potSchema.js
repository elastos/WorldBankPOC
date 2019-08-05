const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../api/utils/APIError');


/**
 * Credit Schema
 * @private
 */
const potSchema = new mongoose.Schema({
  peerId: {
    type: String, //For PoC, we use String instead of hash256 for easier human reading.
    //Of course, it is not efficient. We will change later in product
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  potHash:{
    type:String,
    required: true,
    index:true,
  },
  pcrReading: {
    type: String,
    maxlength: 128,
    required: false, //this is optional
    index: false,
    trim: true,
  },
  // pcrReading: {
  //   type: String,
  //   maxlength: 128,
  //   required: false, //this is optional
  //   index: false,
  //   trim: true,
  // },
  hacked:{
    type: Boolean,

  },
  location : {
    type: [Number],  // [lat, long]
    required: false
  }

}, {
  timestamps: true,
});

potSchema.statics = {
  async get(potHash){
    const pot = await this.findOne({potHash}).exec();
    return pot;
  },
  async newPot(pot){
    const {potHash} = pot;
    //because pot is immutable, we do not allow update on existing pot record
    const existsPot = await this.findOne({potHash}).exec();
    if(existsPot){
      console.log('because pot is immutable, we do not allow update on existing pot record');
      return null;
    }
    return this.create(pot);
  }
};

module.exports = mongoose.model('Pot', potSchema);
