import {tryParseJson, logToWebPage, updateLog} from './utils';
import _ from 'lodash';
const {utils, ecvrf, sortition} = require('vrf.js');
import {sha256} from 'js-sha256';
import Big from 'big.js';
import {validateVrf, validatePot, verifyOthersRemoteAttestationVrfAndProof}  from '../remoteAttestation';
import {chooseExecutorAndMonitors, executeComputeUsingEval} from '../computeTask';


module.exports = (ipfs, room, options) => {
  const option = {};
  const roomName = 'townHall';
  const messageHandlers = [];
  
  const peerJoinedHandler = (peer)=>console.log('peer ' + peer + ' joined');
  messageHandlers.push({message: 'peer joined', handler: peerJoinedHandler});
  const peerLeftHandler = (peer) => console.log('peer ' + peer + ' left');
  messageHandlers.push({message: 'peer left', handler: peerLeftHandler});
  messageHandlers.push({message:'subscribed', handler: (m) => {console.log("...... subscribe....", m)}});


  const rpcHandler = async (message) => {
    console.log('In townhall got RPC message from ' + message.from + ': ', message);
    if(! message.guid || ! message.verb)
      return console.log("twonHall RPC handler got a message not standard RPC,", message);
    const messageObj = tryParseJson(message.data.toString());
    if(! messageObj)
      return console.log("townHallMessageHandler received non-parsable message, ", messageString);
    
    switch(messageObj.type){
      case "reqUserInfo":{
        const {userInfo} = options;
        const {userName, publicKey} = userInfo;

        const resMessage = {
          type:'resUserInfo',
          userInfo:{userName, publicKey}
        }
        room.rpcResponse(message.from, JSON.stringify(resMessage), message.guid);
        logToWebPage(`send back reqUserInfo to townhall manager using RPC response`, {resMessage, guid: message.guid});
        break;
      }

      case "reqRemoteAttestation":{//Now I am new node, sending back poT after validate the remote attestation is real
        const { j, proof, value, taskCid, publicKey, userName, blockHeightWhenVRF} = messageObj;
        const blockCid = options.blockHistory[blockHeightWhenVRF] || options.blockCid;
        
        const validateReturn = await validateVrf({ipfs, j, proof, value, blockCid, taskCid, publicKey, userName});

        if(! validateReturn.result){
          logToWebPage(`VRF Validation failed, reason is `, validateReturn.reason);
          updateLog('req_ra', {
            name : userName,
            vrf : 'No',
            cid : messageObj.taskCid
          });
          break;
        }
        logToWebPage(`VRF Validation passed`);
        const proofOfTrust = window.proofOfTrustTest? window.proofOfTrustTest : {
          psrData:'placeholder',
          isHacked:false,
          tpmPublicKey:'placeholder'
        }
        const resRemoteAttestationObj = {
          type:'resRemoteAttestation',
          proofOfVrf:messageObj,
          proofOfTrust
        }

        room.rpcResponse(message.from, JSON.stringify(resRemoteAttestationObj), message.guid);

        updateLog('req_ra', {
          name : userName,
          vrf : 'Yes',
          cid : messageObj.taskCid,
          proofOfVrf: messageObj,
          proofOfTrust
        });
        
        logToWebPage(`send back resRemoteAttestation to the remote attestator ${message.from}, payload is `, resRemoteAttestationObj);
        break;
      }
      case 'computeTaskWinnerApplication':{
        if(messageObj.userName == options.userInfo.userName){
          //myself
          break;
        }
        const { j, proof, value, taskCid, publicKey, userName, blockHeightWhenVRF} = messageObj;
        const blockCid = options.blockHistory[blockHeightWhenVRF];
        const validateReturn = await validateVrf({ipfs, j, proof, value, blockCid, taskCid, publicKey, userName});
        if(! validateReturn.result){
          logToWebPage(`VRF Validation failed, reason is `, validateReturn.reason);
          break;
        }
        //logToWebPage(`VRF Validation passed`);
        if (options.computeTaskGroup && options.computeTaskGroup[messageObj.taskCid]){
          
          options.computeTaskGroup[messageObj.taskCid].push({j, proof, value, taskCid, publicKey, userName, blockHeightWhenVRF});
        }else{
          //do nothing. since I am not lucky enough to get involved in this task, I do not bother to know who is in , unless I am a hacker
        }
        //logToWebPage('current options.computeTaskGroup', options.computeTaskGroup);
        break;
      }
      case "remoteAttestationDone":{
        
        break;
      }
      case 'reqTaskParams':{
        console.log('reqTaskParams, messageObj', messageObj);
        
        const mayDelayExecuteDueToBlockDelay = (messageObj)=>{
          const {taskCid,executor, blockHeight} = messageObj;
          if(blockHeight <= options.block.blockHeight){
            //this node is slower than the executor who send me the request. I have to wait till I have such a block to continue;
            
            const task = options.block.pendingTasks[taskCid];
            
            const calculateExecutor = chooseExecutorAndMonitors(task);
            if(! calculateExecutor){
              logToWebPage(`Cannot find executor`, {task, blockHeight:options.block.blockHeight});
              return;
            }
            if(chooseExecutorAndMonitors(task).userName != executor.userName){
              logToWebPage(`Executor validate fail`, {executor, task});
              return;
            }
            const resTaskParams = {
              type:'resTaskParams',
              data:['Hello', " World!"],
              taskCid
            };
            room.sendTo(message.from, JSON.stringify(resTaskParams));
            logToWebPage(`Sending response for Task data back to executor.`, resTaskParams);
          }else{
            _.delay(mayDelayExecuteDueToBlockDelay, 1000, messageObj);
          }
        }
        mayDelayExecuteDueToBlockDelay(messageObj)
        break;
      }
      case 'reqLambdaParams':{
        //console.log('reqLambdaParams, messageObj', messageObj);
        const mayDelayExecuteDueToBlockDelay = (messageObj)=>{
          const {taskCid,executor, blockHeight} = messageObj;
          if(blockHeight <= options.block.blockHeight){
            const {taskCid,executor} = messageObj;
            const task = options.block.pendingTasks[taskCid];
            console.log('task,', task);
            const calculateExecutor = chooseExecutorAndMonitors(task);
            if(! calculateExecutor){
              logToWebPage(`Cannot find executor`, {task , blockHeight:options.block.blockHeight});
              return;
            }
            if(chooseExecutorAndMonitors(task).userName != executor.userName){
              logToWebPage(`Executor validate fail`, {executor, task});
              return;
            }
            const resLambdaParams = {
              type:'resLambdaParams',
              code:'args[0] + args[1]',
              taskCid
            };
            room.sendTo(message.from, JSON.stringify(resLambdaParams));
            logToWebPage(`Sending response for Lambda Params back to executor.`, resLambdaParams);
          }else{
            _.delay(mayDelayExecuteDueToBlockDelay, 1000, messageObj);
          }
        }
        mayDelayExecuteDueToBlockDelay(messageObj);
        break;
      }
      case 'resLambdaParams':{
        const {code, taskCid} = messageObj;
        console.log('code, ', code);
        logToWebPage(`I have got the lambda code from lambda owner, `, code);
        options.computeTaskBuffer = options.computeTaskBuffer || {};
        options.computeTaskBuffer[taskCid] = options.computeTaskBuffer[taskCid] || {};
        if(options.computeTaskBuffer[taskCid].code){
          logToWebPage(`Error, executor has got the code already, why a new code come up again?`, {code, buffer: options.computeTaskBuffer});
          break;
        }

        options.computeTaskBuffer[taskCid].code = code;
        const result = executeIfParamsAreReady(options.computeTaskBuffer, taskCid);
        if(result){
          sendComputeTaskDone(options, taskCid);
        }
        break;
      }
      case 'resTaskParams':{
        const {data, taskCid} = messageObj;
        console.log('data, ', data);
        logToWebPage(`I have got the task data from task owner, `, data);
        options.computeTaskBuffer = options.computeTaskBuffer || {};
        options.computeTaskBuffer[taskCid] = options.computeTaskBuffer[taskCid] || {};
        if(options.computeTaskBuffer[taskCid].data){
          logToWebPage(`Error, executor has got the data already, why a new data come up again?`, {data, buffer: options.computeTaskBuffer});
          break;
        }

        options.computeTaskBuffer[taskCid].data = data;
        const result = executeIfParamsAreReady(options.computeTaskBuffer, taskCid);
        if(result){
          sendComputeTaskDone(options, taskCid);
        }
        break;
      }
      default:{
        return console.log("townHallMessageHandler received unknown type message object,", messageObj );
      } 
    }//switch
    
  };
  const directMessageHandler = async (message) => {
    console.log('In townhall got direct message from ' + message.from + ': ' + message.data.toString());
    const messageObj = tryParseJson(message.data.toString());
    if(! messageObj)
      return console.log("townHallMessageHandler received non-parsable message, ", messageString);
    switch(messageObj.type){
      case 'computeTaskWinnerApplication':{
        if(messageObj.userName == options.userInfo.userName){
          //myself
          break;
        }
        const { j, proof, value, taskCid, publicKey, userName, blockHeightWhenVRF} = messageObj;
        const blockCid = options.blockHistory[blockHeightWhenVRF];
        const validateReturn = await validateVrf({ipfs, j, proof, value, blockCid, taskCid, publicKey, userName});
        if(! validateReturn.result){
          logToWebPage(`VRF Validation failed, reason is `, validateReturn.reason);
          break;
        }
        //logToWebPage(`VRF Validation passed`);
        if (options.computeTaskGroup && options.computeTaskGroup[messageObj.taskCid]){
          
          options.computeTaskGroup[messageObj.taskCid].push({j, proof, value, taskCid, publicKey, userName, blockHeightWhenVRF});
        }else{
          //do nothing. since I am not lucky enough to get involved in this task, I do not bother to know who is in , unless I am a hacker
        }
        //logToWebPage('current options.computeTaskGroup', options.computeTaskGroup);
        break;
      }
      case "remoteAttestationDone":{
        
        break;
      }
      case 'reqTaskParams':{
        console.log('reqTaskParams, messageObj', messageObj);
        
        const mayDelayExecuteDueToBlockDelay = (messageObj)=>{
          const {taskCid,executor, blockHeight} = messageObj;
          if(blockHeight <= options.block.blockHeight){
            //this node is slower than the executor who send me the request. I have to wait till I have such a block to continue;
            
            const task = options.block.pendingTasks[taskCid];
            
            const calculateExecutor = chooseExecutorAndMonitors(task);
            if(! calculateExecutor){
              logToWebPage(`Cannot find executor`, {task, blockHeight:options.block.blockHeight});
              return;
            }
            if(chooseExecutorAndMonitors(task).userName != executor.userName){
              logToWebPage(`Executor validate fail`, {executor, task});
              return;
            }
            const resTaskParams = {
              type:'resTaskParams',
              data:['Hello', " World!"],
              taskCid
            };
            room.sendTo(message.from, JSON.stringify(resTaskParams));
            logToWebPage(`Sending response for Task data back to executor.`, resTaskParams);
          }else{
            _.delay(mayDelayExecuteDueToBlockDelay, 1000, messageObj);
          }
        }
        mayDelayExecuteDueToBlockDelay(messageObj)
        break;
      }
      case 'reqLambdaParams':{
        //console.log('reqLambdaParams, messageObj', messageObj);
        const mayDelayExecuteDueToBlockDelay = (messageObj)=>{
          const {taskCid,executor, blockHeight} = messageObj;
          if(blockHeight <= options.block.blockHeight){
            const {taskCid,executor} = messageObj;
            const task = options.block.pendingTasks[taskCid];
            console.log('task,', task);
            const calculateExecutor = chooseExecutorAndMonitors(task);
            if(! calculateExecutor){
              logToWebPage(`Cannot find executor`, {task , blockHeight:options.block.blockHeight});
              return;
            }
            if(chooseExecutorAndMonitors(task).userName != executor.userName){
              logToWebPage(`Executor validate fail`, {executor, task});
              return;
            }
            const resLambdaParams = {
              type:'resLambdaParams',
              code:'args[0] + args[1]',
              taskCid
            };
            room.sendTo(message.from, JSON.stringify(resLambdaParams));
            logToWebPage(`Sending response for Lambda Params back to executor.`, resLambdaParams);
          }else{
            _.delay(mayDelayExecuteDueToBlockDelay, 1000, messageObj);
          }
        }
        mayDelayExecuteDueToBlockDelay(messageObj);
        break;
      }
      case 'resLambdaParams':{
        const {code, taskCid} = messageObj;
        console.log('code, ', code);
        logToWebPage(`I have got the lambda code from lambda owner, `, code);
        options.computeTaskBuffer = options.computeTaskBuffer || {};
        options.computeTaskBuffer[taskCid] = options.computeTaskBuffer[taskCid] || {};
        if(options.computeTaskBuffer[taskCid].code){
          logToWebPage(`Error, executor has got the code already, why a new code come up again?`, {code, buffer: options.computeTaskBuffer});
          break;
        }

        options.computeTaskBuffer[taskCid].code = code;
        const result = executeIfParamsAreReady(options.computeTaskBuffer, taskCid);
        if(result){
          sendComputeTaskDone(options, taskCid);
        }
        break;
      }
      case 'resTaskParams':{
        const {data, taskCid} = messageObj;
        console.log('data, ', data);
        logToWebPage(`I have got the task data from task owner, `, data);
        options.computeTaskBuffer = options.computeTaskBuffer || {};
        options.computeTaskBuffer[taskCid] = options.computeTaskBuffer[taskCid] || {};
        if(options.computeTaskBuffer[taskCid].data){
          logToWebPage(`Error, executor has got the data already, why a new data come up again?`, {data, buffer: options.computeTaskBuffer});
          break;
        }

        options.computeTaskBuffer[taskCid].data = data;
        const result = executeIfParamsAreReady(options.computeTaskBuffer, taskCid);
        if(result){
          sendComputeTaskDone(options, taskCid);
        }
        break;
      }
      default:{
        return console.log("townHallMessageHandler received unknown type message object,", messageObj );
      } 
    }//switch
    
  };

  messageHandlers.push({
    message: 'rpcDirect',
    handler: (m)=>rpcHandler(m)
  });
  
  messageHandlers.push({
    message: 'message',
    handler: (m)=>directMessageHandler(m)
  });
  
  return messageHandlers;

};


const executeIfParamsAreReady = (computeTaskBuffer, taskCid)=>{
  if(computeTaskBuffer[taskCid].code && computeTaskBuffer[taskCid].data){
    logToWebPage(`Executor has got both data and code, it can start execution`, computeTaskBuffer[taskCid])
    const result = executeComputeUsingEval(computeTaskBuffer[taskCid]);
    delete computeTaskBuffer[taskCid];
    logToWebPage( `Execution result:`, result);
    return result;
  }
  return null;
}

const sendComputeTaskDone = (options, taskCid)=>{
  const {userInfo} = options;
  const computeTaskDoneObj = {
    txType:'computeTaskDone',
    userName: userInfo.userName,
    taskCid
    
  }
  window.rooms.taskRoom.broadcast(JSON.stringify(computeTaskDoneObj));

}