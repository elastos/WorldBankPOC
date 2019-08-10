import mongoose from 'mongoose';

const BlockSchema = new mongoose.Schema({
  prev_hash : {
    type : String,
    required: true
  },
  total_gas : {
    type : Number,
    required : true
  },
  total_credit : {
    type : Number,
    required : true
  },
  tx_log : {
    type : [String],
    required : true
  },
  block_owner : {
    type : String,
    required : true
  },
  height : {
    type : Number,
    required : true
  },
  hash : {
    type : String,
    required : true
  },
  


}, {
  timestamps: true,
});

BlockSchema.statics = {
  
};

export default mongoose.model('BlockChain', BlockSchema);