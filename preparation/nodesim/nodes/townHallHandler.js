import {tryParseJson, o} from '../shared/utilities';
import _ from 'lodash';
//import {validateVrf, validatePot, verifyOthersRemoteAttestationVrfAndProof}  from '../remoteAttestation';
//import {chooseExecutorAndMonitors, executeComputeUsingEval} from '../computeTask';

exports.peerJoined = (peer)=>console.log(`peer ${peer} joined`);
exports.peerLeft = (peer)=>console.log(`peer ${peer} left`);
exports.subscribed = (m)=>console.log(`Subscribed ${m}`);


exports.rpcDirect = (room)=>(message) => {
  //o('log', 'In townhall got RPC message from ' + message.from + ': ', message);
  if(! message.guid || ! message.verb)
    return console.log("twonHall RPC handler got a message not standard RPC,", message);
  const messageObj = tryParseJson(message.data.toString());
  if(! messageObj)
    return console.log("townHallMessageHandler received non-parsable message, ", messageString);
  
  const handlerFunction = rpcDirectHandler[messageObj.type];
  if(typeof handlerFunction == 'function'){
    handlerFunction({from:message.from, guid:message.guid, messageObj})();
    return
  }
  else{
    return console.log("townHallMessageHandler received unknown type message object,", messageObj );
  }
}

exports.rpcResponseWithNewRequest = (room)=>(args)=>{
  const {sendToPeerId, message, guid, responseCallBack} = args;
  room.rpcResponseWithNewRequest(sendToPeerId, message, guid, responseCallBack);
}
exports.rpcRequest = (room)=>(args)=>{
  const {sendToPeerId, message, responseCallBack} = args;
  // sendToPeerId:tx.ipfsPeerId, 
  // message:JSON.stringify(raReqObj), 
  // responseCallBack:handleRaResponse
  room.rpcRequest(sendToPeerId, message, responseCallBack);

}

exports.rpcResponse =  (room)=>(args)=>{
  const {sendToPeerId, message, guid} = args;
  room.rpcResponse(sendToPeerId, message, guid);
}

const rpcDirectHandler = {
  reqUserInfo: ({from, guid})=>()=>{
    const resMessage = {
      type:'requestRandomUserInfo',
    };
    
    const responseCallBack = (res, err)=>{
      if(err)
        console.log("rpcResponseWithNewRequest err,",err);
      else{
        const {userInfo} = res;
        if(! userInfo){
          o('error', 'cannot find userinfo from requestRandomUserInfo response. probably all users are online. No need for more terminal');
        }else{

          global.userInfo = {
            userName: userInfo.name,
            publicKey: userInfo.pub,
            privateKey: userInfo.pri
          };
          console.log("User info confirmed:", global.userInfo);
        }

      }
    };

    global.rpcEvent.emit('rpcResponseWithNewRequest', {
      sendToPeerId: from, 
      message : JSON.stringify(resMessage), 
      guid,
      responseCallBack
    });


    //o('log', `send back reqUserInfo to townhall manager using RPC response`, {resMessage, guid: message.guid});
  },
  simulatorRequestAction:({from, guid, messageObj, room})=> async ()=>{

    console.log('from simulator request action,', messageObj);

    const txType = messageObj.action.txType;
    const cidObj = Object.assign({}, messageObj.action);
    delete cidObj.txType;

    const cid = (await global.ipfs.dag.put(cidObj)).toBaseEncodedString();
    global.broadcastEvent.emit('taskRoom', JSON.stringify({txType, cid}));
    global.rpcEvent.emit('rpcResponse', {
      sendToPeerId: from, 
      message : JSON.stringify({result:"OK"}), 
      guid : guid});

    console.log("send back to simulatorRequestAction requestor:")
  },
  reqRemoteAttestation: ({from, guid, messageObj})=> async ()=>{//Now I am new node, sending back poT after validate the remote attestation is real
    const { j, proof, value, taskCid, publicKey, userName, blockHeightWhenVRF} = messageObj;
    const validateReturn = await validateVrf({ipfs, j, proof, value, blockCid:blockHistory[blockHeightWhenVRF], taskCid, publicKey, userName});

    if(! validateReturn.result){
      o('log', `VRF Validation failed, reason is `, validateReturn.reason);
      updateLog('req_ra', {
        name : userName,
        vrf : 'No',
        cid : messageObj.taskCid
      });
      return;
    }
    logToWebPage(`VRF Validation passed`);
    const proofOfTrust = {
      psrData:'placeholder',
      isHacked:false,
      tpmPublicKey:'placeholder'
    }
    const resRemoteAttestationObj = {
      type:'resRemoteAttestation',
      proofOfVrf:messageObj,
      proofOfTrust
    }
    global.rpcEvent.emit('rpcResponse', {
      sendToPeerId: from, 
      message : JSON.stringify(resRemoteAttestationObj), 
      guid});
    
    updateLog('req_ra', {
      name : userName,
      vrf : 'Yes',
      cid : messageObj.taskCid,
      proofOfVrf: messageObj,
      proofOfTrust
    });
    
    o('log', `send back resRemoteAttestation to the remote attestator ${from}, payload is `, resRemoteAttestationObj);
    return;
  },
  computeTaskWinnerApplication:({from, guid, messageObj, room})=> async ()=>{
    if(messageObj.userName == global.userInfo.userName){
      //myself
      return o('log', 'I am the winner myself, I cannot take computeTaskWinnerApplication message');
    }
    const { j, proof, value, taskCid, publicKey, userName, blockHeightWhenVRF} = messageObj;
    const validateReturn = await validateVrf({ipfs, j, proof, value, blockCid: blockHistory[blockHeightWhenVRF], taskCid, publicKey, userName});
    if(! validateReturn.result){
      o('log',`VRF Validation failed, reason is `, validateReturn.reason);
      return;
    }
    o('log', `VRF Validation passed. What's next???`);
    
  },
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

