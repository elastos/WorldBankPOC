
const mongoose = require('mongoose');
const sha256 = require('js-sha256');
/**
 * Credit Schema
 * @private
 */
const raSignTxSchema = new mongoose.Schema({
  peerId: {
    type: String, //For PoC, we use String instead of hash256 for easier human reading.
    //Of course, it is not efficient. We will change later in product
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },

  potHash: {
    type: String,
    maxlength: 128,
    required: true, 
    index: true,
  },

  sig: {
    type: String,
    maxlength: 128,
    required: true, 
    index: true,
  },

  pi: {
    type: String,
    maxlength: 128,
    required: true, 
    index: true,
  },

  
  
}, {
  timestamps: true,
});


exports.signRaTask = (sig, raTaskTxHash, pi, raResult) => {
  console.log('placeholder for eth transaction to sign ra result');
  
};