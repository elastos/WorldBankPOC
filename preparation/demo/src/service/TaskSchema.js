import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  peerId : {
    type: String, 
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name : {
    type : String,
    required : true,
  },
  description : {
    type : String,
    required : false,
    default : ''
  },
  amount : {
    type : Number,
    required : true,
  },
  status : {
    type : String,   // elect, processing, completed
    required : false,
    default : 'start'
  },
  type : {
    type : String,  // remote_attestation, caculate
    required : true
  },
  joiner : {
    type : [String],
    required : false,
    default : []
  },



}, {
  timestamps: true,
});

TaskSchema.statics = {
  
};

export default mongoose.model('Task', TaskSchema);