import TaskService from './TaskService';

export default {
  getTaskService(){
    return new TaskService();
  }
};