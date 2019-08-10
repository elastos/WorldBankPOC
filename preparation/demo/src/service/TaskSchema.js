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
    required : true
  },
  type : {
    type : String,  // remote_attestation, calculate
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
  async addTaskJoiner(peerId, taskId){
    const rs = await this.findOneAndUpdate({_id: taskId}, {
      $push : {
        joiner : peerId
      }
    }).exec();
    return rs;
  },
  async setStatus(taskId, status){
    const rs = await this.findOneAndUpdate({_id: taskId}, {
      status
    }).exec();
    return rs;
  }
};

export default mongoose.model('Task', TaskSchema);