import {tryParseJson, o} from './utilities';
import _ from 'lodash';
//import {validateVrf, validatePot, verifyOthersRemoteAttestationVrfAndProof}  from '../remoteAttestation';
//import {chooseExecutorAndMonitors, executeComputeUsingEval} from '../computeTask';

exports.peerJoined = (peer)=>console.log(`peer ${peer} joined`);
exports.peerLeft = (peer)=>console.log(`peer ${peer} left`);
exports.subscribed = (m)=>console.log(`Subscribed ${m}`);


exports.rpcDirect = (room)=>(message) => {
  o('log', 'In townhall got RPC message from ' + message.from + ': ', message);
  if(! message.guid || ! message.verb)
    return console.log("twonHall RPC handler got a message not standard RPC,", message);
  const messageObj = tryParseJson(message.data.toString());
  o('log','messageObj', messageObj);
  if(! messageObj)
    return console.log("townHallMessageHandler received non-parsable message, ", messageString);
  
  o('log', `handling message type`, messageObj);
    
  const handlerFunction = rpcDirectHandler[messageObj.type];
  if(typeof handlerFunction == 'function'){
    handlerFunction({message, room});
    return
  }
  else{
    return console.log("townHallMessageHandler received unknown type message object,", messageObj );
  }
}

const rpcDirectHandler = {
  reqUserInfo: ({message, room})=>{
    const resMessage = {
      type:'requestRandomUserInfo',
    };
    room.rpcResponseWithNewRequest(message.from, JSON.stringify(resMessage), message.guid, (res, err)=>{
      o('log', '2nd round response,', res, err);
      if(err)
        console.log("rpcResponseWithNewRequest err,",err);
      else{
        const {userInfo} = res;
        if(! userInfo){
          o('error', 'cannot find userinfo from requestRandomUserInfo response. probably all users are online. No need for more terminal');
        }else{
          global.userInfo = userInfo;
          
        }

      }
    });
    //o('log', `send back reqUserInfo to townhall manager using RPC response`, {resMessage, guid: message.guid});
  },
  // reqRemoteAttestation: ()=>{//Now I am new node, sending back poT after validate the remote attestation is real
  //   const { j, proof, value, taskCid, publicKey, userName, blockHeightWhenVRF} = messageObj;
  //   const validateReturn = await validateVrf({ipfs, j, proof, value, blockCid:blockHistory[blockHeightWhenVRF], taskCid, publicKey, userName});

  //   if(! validateReturn.result){
  //     logToWebPage(`VRF Validation failed, reason is `, validateReturn.reason);
  //     updateLog('req_ra', {
  //       name : userName,
  //       vrf : 'No',
  //       cid : messageObj.taskCid
  //     });
  //     return;
  //   }
  //   logToWebPage(`VRF Validation passed`);
  //   const proofOfTrust = window.proofOfTrustTest? window.proofOfTrustTest : {
  //     psrData:'placeholder',
  //     isHacked:false,
  //     tpmPublicKey:'placeholder'
  //   }
  //   const resRemoteAttestationObj = {
  //     type:'resRemoteAttestation',
  //     proofOfVrf:messageObj,
  //     proofOfTrust
  //   }

  //   room.rpcResponse(message.from, JSON.stringify(resRemoteAttestationObj), message.guid);

  //   updateLog('req_ra', {
  //     name : userName,
  //     vrf : 'Yes',
  //     cid : messageObj.taskCid,
  //     proofOfVrf: messageObj,
  //     proofOfTrust
  //   });
    
  //   logToWebPage(`send back resRemoteAttestation to the remote attestator ${message.from}, payload is `, resRemoteAttestationObj);
  //   return;
  // },
  // computeTaskWinnerApplication:()=>{
  //   if(messageObj.userName == userInfo.userName){
  //     //myself
  //     return
  //   }
  //   const { j, proof, value, taskCid, publicKey, userName, blockHeightWhenVRF} = messageObj;
  //   const validateReturn = await validateVrf({ipfs, j, proof, value, blockCid: blockHistory[blockHeightWhenVRF], taskCid, publicKey, userName});
  //   if(! validateReturn.result){
  //     logToWebPage(`VRF Validation failed, reason is `, validateReturn.reason);
  //     return;
  //   }
  //   //logToWebPage(`VRF Validation passed`);
    
  // },
  // remoteAttestationDone: ()=>{
  
  // },
  // reqTaskParams: ()=>{
  //   console.log('reqTaskParams, messageObj', messageObj);
    
  //   const mayDelayExecuteDueToBlockDelay = (messageObj)=>{
  //     const {taskCid,executor, blockHeight} = messageObj;
  //     if(blockHeight <= block.blockHeight){
  //       //this node is slower than the executor who send me the request. I have to wait till I have such a block to continue;
        
  //       const task = block.pendingTasks[taskCid];
        
  //       const calculateExecutor = chooseExecutorAndMonitors(task);
  //       if(! calculateExecutor){
  //         logToWebPage(`Cannot find executor`, {task, blockHeight:block.blockHeight});
  //         return;
  //       }
  //       if(chooseExecutorAndMonitors(task).userName != executor.userName){
  //         logToWebPage(`Executor validate fail`, {executor, task});
  //         return;
  //       }
  //       const resTaskParams = {
  //         type:'resTaskParams',
  //         data:['Hello', " World!"],
  //         taskCid
  //       };
  //       room.rpcResponse(message.from, JSON.stringify(resTaskParams), message.guid);
  //       logToWebPage(`Sending response for Task data back to executor.`, resTaskParams);
  //     }else{
  //       _.delay(mayDelayExecuteDueToBlockDelay, 1000, messageObj);
  //     }
  //   }
  //   mayDelayExecuteDueToBlockDelay(messageObj)
    
  // },
  // reqLambdaParams: ()=>{
  //   //console.log('reqLambdaParams, messageObj', messageObj);
  //   const mayDelayExecuteDueToBlockDelay = (messageObj)=>{
  //     const {taskCid,executor, blockHeight} = messageObj;
  //     if(blockHeight <= block.blockHeight){
  //       const {taskCid,executor} = messageObj;
  //       const task = block.pendingTasks[taskCid];
  //       console.log('task,', task);
  //       const calculateExecutor = chooseExecutorAndMonitors(task);
  //       if(! calculateExecutor){
  //         logToWebPage(`Cannot find executor`, {task , blockHeight:block.blockHeight});
  //         return;
  //       }
  //       if(chooseExecutorAndMonitors(task).userName != executor.userName){
  //         logToWebPage(`Executor validate fail`, {executor, task});
  //         return;
  //       }
  //       const resLambdaParams = {
  //         type:'resLambdaParams',
  //         code:'args[0] + args[1]',
  //         taskCid
  //       };
  //       room.rpcResponse(message.from, JSON.stringify(resLambdaParams), message.guid);
  //       logToWebPage(`Sending response for Lambda Params back to executor.`, resLambdaParams);
  //     }else{
  //       _.delay(mayDelayExecuteDueToBlockDelay, 1000, messageObj);
  //     }
  //   }
  //   mayDelayExecuteDueToBlockDelay(messageObj);
    
  // }
}


