import mongoose from 'mongoose';

const TaskLogSchema = new mongoose.Schema({
  taskId : {
    type: String, 
    required: true
  },
  content : {
    type: String,
    required: true,
  },
  type : {
    type: String,
    required: true
  },
  data : {
    type: Object,
    required : false,
    default : {}
  }




}, {
  timestamps: true,
});

TaskLogSchema.statics = {
  async logForCreated(taskId, peerId){
    const d = {
      taskId,
      type : 'created',
      content : `Peer [${peerId}] create the task`
    };
    return await this.create(d);
  },
  async logForJoin(taskId, joinPeerId){
    const d = {
      taskId,
      type : 'join',
      content : `Peer [${joinPeerId}] join the task`
    };
    return await this.create(d);
  },
  async logForReadyToProcess(taskId){
    const d = {
      taskId,
      type : 'ready_to_start',
      content : 'Joiners enough, start to process'
    };
    return await this.create(d);
  },
  async logForSelectWinner(taskId, winnerPeerId){
    const d = {
      taskId,
      type : 'select_winner',
      content : `The winner is peer [${winnerPeerId}], will start to processing`
    };
    return await this.create(d);
  },
  async logForProduceJoinerResult(taskId, peerResultObj){
    const d = {
      taskId,
      type : 'peer_result',
      data : peerResultObj,
      content : `Joiner result : ${JSON.stringify(peerResultObj)}`
    };
    return await this.create(d);
  },
  async logForRunConsensus(taskId, rewardPeers, penaltyPeers){
    const d = {
      taskId,
      type : 'consensus',
      data : {
        rewardPeers, 
        penaltyPeers
      },
      content : `Task run consensus`
    };
    return await this.create(d);
  },
  async logForReadyToReward(taskId){
    const d = {
      taskId,
      type : 'ready_to_reward',
      content : `Processing end, start to distribute reward.`
    };
    return await this.create(d);
  },
  async logForRewardFinish(taskId, resultPeers){
    const d = {
      taskId,
      type : 'reward_finish',
      data : resultPeers,
      content : `Reward completed`
    };
    return await this.create(d);
  },
  async logForFinish(taskId){
    const d = {
      taskId,
      type : 'task_finish',
      content : 'Task finish'
    };
    return await this.create(d);
  }
};

export default mongoose.model('TaskLog', TaskLogSchema);