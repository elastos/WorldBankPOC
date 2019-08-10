import TaskService from './TaskService';
import BlockService from './BlockService';

const _ts = new TaskService();
const _bs = new BlockService();

export default {
  getTaskService(){
    return _ts;
  },
  getBlockService(){
    return _bs;
  }
};