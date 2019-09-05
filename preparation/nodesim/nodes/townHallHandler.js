import {tryParseJson, o} from '../shared/utilities';
import _ from 'lodash';
import {validateRemoteAttestationVrf, validateComputeTaskVrf}  from '../shared/remoteAttestation';
import {executeComputeUsingEval} from '../shared/computeTask';
import ComputeTaskPeersMgr from './nodeSimComputeTaskPeersMgr';

exports.peerJoined = (peer)=>console.log(`peer ${peer} joined`);
exports.peerLeft = (peer)=>console.log(`peer ${peer} left`);
exports.subscribed = (m)=>console.log(`Subscribed ${m}`);
const updateLog = ()=>{};

exports.rpcDirect = (room)=>(message) => {
  //o('log', 'In townhall got RPC message from ' + message.from + ': ', message);
  if(! message.guid || ! message.verb)
    return console.log("twonHall RPC handler got a message not standard RPC,", message);
  const messageObj = tryParseJson(message.data.toString());
  if(! messageObj)
    return console.log("townHallMessageHandler received non-parsable message, ", messageString);
  
  const handlerFunction = rpcDirectHandler[messageObj.type];
  if(typeof handlerFunction == 'function'){
    handlerFunction({from:message.from, guid:message.guid, messageObj, room})();
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
            privateKey: userInfo.pri,
            peerId:global.ipfs._peerInfo.id.toB58String()
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
    switch(txType){
      case 'newNodeJoinNeedRa':
        messageObj.action.ipfsPeerId = ipfs._peerInfo.id.toB58String();
        break;
    }
    const cidObj = Object.assign({}, messageObj.action);
    delete cidObj.txType;

    const cid = (await global.ipfs.dag.put(cidObj)).toBaseEncodedString();

    if(txType === 'computeTask'){
      global.nodeSimCache.computeTaskPeersMgr.addNewComputeTask(cid);
      const mySpecialRole = global.nodeSimCache.computeTaskPeersMgr.assignSpecialRoleToTask(cid, global.userInfo.userName);
      if(mySpecialRole){
        return o('debug', `I am the ${mySpecialRole} in this task cid ${cid} myself, I cannot do execution compute task on myself`);
      };
      
    }
    global.broadcastEvent.emit('taskRoom', JSON.stringify({txType, cid}));
    global.rpcEvent.emit('rpcResponse', {
      sendToPeerId: from, 
      message : JSON.stringify({result:"OK"}), 
      guid : guid});

    console.log("send back to simulatorRequestAction requestor:")
  },
  reqRemoteAttestation: ({from, guid, messageObj})=> async ()=>{//Now I am new node, sending back poT after validate the remote attestation is real
    const { j, proof, value, taskCid, publicKey, userName, blockHeightWhenVRF} = messageObj;
    const validateReturn = await validateRemoteAttestationVrf({ipfs, j, proof, value, blockCid:global.blockMgr.getBlockCidByHeight(blockHeightWhenVRF), taskCid, publicKey, userName});

    if(! validateReturn.result){
      o('log', `VRF Validation failed, reason is `, validateReturn.reason);
      updateLog('req_ra', {
        name : userName,
        vrf : 'No',
        cid : messageObj.taskCid
      });
      return;
    }
    o('log', `VRF Validation passed`);
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

  reqTaskParams: ({from, guid, messageObj, room})=>{
    console.log('I have got a request for reqTaskParams, messageObj', messageObj);
    
    const mayDelayExecuteDueToBlockDelay = (messageObj)=>{
      const {taskCid, blockHeight} = messageObj;
      if(blockHeight <= block.blockHeight){
        //this node is slower than the executor who send me the request. I have to wait till I have such a block to continue;
        
        const task = block.pendingTasks[taskCid];
        
        if( global.nodeSimCache.computeTaskPeersMgr.getExecutorPeer(taskCid) != from){
          o('log', `Executor validate fail`);
          return;
        }
        const resTaskParams = {
          type:'resTaskParams',
          data:['Hello', " World!"],
          taskCid
        };
        room.rpcResponse(from, JSON.stringify(resTaskParams),guid);
        o('log', `Sending response for Task data back to executor.`, resTaskParams);
      }else{
        _.delay(mayDelayExecuteDueToBlockDelay, 1000, messageObj);
      }
    }
    mayDelayExecuteDueToBlockDelay(messageObj)
    
  },
  reqLambdaParams: ({from, guid, messageObj, room})=>{
    console.log('I have got a request for Lambda Params reqLambdaParams, messageObj', messageObj);
    const mayDelayExecuteDueToBlockDelay = (messageObj)=>{
      
      if(blockHeight <= block.blockHeight){
        const {taskCid} = messageObj;
        const task = block.pendingTasks[taskCid];
        console.log('task,', task);

        if( global.nodeSimCache.computeTaskPeersMgr.getExecutorPeer(taskCid) != from){
          o('log', `Executor validate fail`);
          return;
        }
        const resLambdaParams = {
          type:'resLambdaParams',
          code:'args[0] + args[1]',
          taskCid
        };
        room.rpcResponse(from, JSON.stringify(resLambdaParams), guid);
        o('log', `Sending response for Lambda Params back to executor.`, resLambdaParams);
      }else{
        _.delay(mayDelayExecuteDueToBlockDelay, 1000, messageObj);
      }
    }
    mayDelayExecuteDueToBlockDelay(messageObj);
    
  },
  reqVerifyPeerVrfForComputeTasks: ({from, guid, messageObj, room})=>{
    o('debug', `I have got other peer sending me his vrf for compute task and ask mine. `, messageObj)

    const handleReqVerifyPeerReRunable = (messageObj, room)=>{
      o('debug', 'inside handleReqVerifyPeerReRunable', messageObj);
      if(messageObj.blockHeight > global.blockMgr.getLatestBlockHeight()){
        /******
         * 
         * This mean I have not receive the latest block while others send me the request. I have to wait to new block arrive and rerun this funciton
         */
        o('debug', 'I have not receive the latest block while others send me the request. I have to wait to new block arrive and rerun this funciton');
        global.blockMgr.reRunFunctionWhenNewBlockArrive(handleReqVerifyPeerReRunable, messageObj, room);
        return
      }
      
      const {type, taskCid, myVrfProofInfo:othersPeerVrfProofInfo, myRoleProofInfo: othersRoleProofInfo} = messageObj;
      
      console.assert(type == "reqVerifyPeerVrfForComputeTasks");

      if(! global.nodeSimCache.computeTaskPeersMgr.checkMyRoleInTask(taskCid)){
        o('error', 'I am not in the exeuction group of cid', taskCid);
        return room.rpcResponse(from, null, guid, 'I am not in the execution group. I should not receive this message. cid:' + taskCid);
      }

      let validationResult = false;
      try{
        validationResult = (global.nodeSimCache.computeTaskPeersMgr.validateOthersRoleProofInfo(taskCid, othersRoleProofInfo)) 
          || global.nodeSimCache.computeTaskPeersMgr.validateOthersPeerVrfProofInfo(taskCid, othersPeerVrfProofInfo);

        if(validationResult){

          global.nodeSimCache.computeTaskPeersMgr.addOtherPeerToMyExecutionPeers(taskCid, addedPeer, otherPeerVrfProofInfo);
          o('log', `I verified another peer username:${otherPeerVrfProofInfo.userName} successfully. I have added him into my execution group`);
          
          const resVerifyPeer = {
            type:'resVerifyPeerVrfForComputeTasks',
            taskCid
          }
         
          switch( global.nodeSimCache.computeTaskPeersMgr.checkMyRoleInTask(taskCid)){
            case ComputeTaskRoles.taskOwner:
              resVerifyPeer.myRoleProofInfo = {
                role:'taskOwner',
                proof:'placeholder'
              };
              break;
            case ComputeTaskRoles.lambdaOwner:
              resVerifyPeer.myRoleProofInfo = {
                role:'lambdaOwner',
                proof:'placeholder'
              };
              break;
            case ComputeTaskRoles.executeGroupNumber:
              resVerifyPeer.myVrfProofInfo = global.nodeSimCache.computeTaskPeersMgr.getMyVrfProofInfo(taskCid);
              break;
            default:
              throw "We have to have a role in the executeGroup, a taskOwner, lambdaOwner, or just executeGroupMember, cannot be nothing"
          }
          
          room.rpcResponse(from, JSON.stringify(resVerifyPeer), guid);
          o('log', `send back to ${userName} resVerifyPeerVrfForComputeTasks`, resVerifyPeer);
          return;
        }
        else{

          o('error', `Validate other peer ${addedPeer} information failed. I cannot add him to my list. In the future, I should report 
          this to Layer One because that peer could be a hacker trying to peek who is the VRF winner and plan DDoS attack. 
          At this moment, we do not do anything. In the future, one possible solution is to abort this whole process and do it again 
          after a pentalty to the possible hacker `);
          room.rpcResponse(from, null, guid, `validating peer ${addedPeer} failed. I cannot add him into my list`);
        }
      }
      catch(e){
        o('error', `when validating otherPeerVrf, exception:${err}`);
        room.rpcResponse(from, null, guid, e);
      }
    }
    try{
      handleReqVerifyPeerReRunable(messageObj, room);
    }
    catch(e){
      o('error', 'exception inside handleReqVerifyPeerReRunable', e);
      room.rpcResponse(from, null, guid, e);
    }
  }
}

 