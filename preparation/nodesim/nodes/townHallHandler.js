import {tryParseJson, o} from '../shared/utilities';
import {validateRemoteAttestationVrf}  from '../shared/remoteAttestation';
import {ComputeTaskRoles} from '../shared/constValue';
import {computeTaskOwnerConfirmationDone, sendComputeTaskRaDone} from '../shared/computeTask';


exports.peerJoined = (peer)=>console.log(`peer ${peer} joined`);
exports.peerLeft = (peer)=>console.log(`peer ${peer} left`);
exports.subscribed = (m)=>console.log(`Subscribed ${m}`);
const updateLog = ()=>{};

exports.rpcDirect = (message) => {
  //o('log', 'In townhall got RPC message from ' + message.from + ': ', message);
  if(! message.guid || ! message.verb)
    return console.log("twonHall RPC handler got a message not standard RPC,", message);
  const messageObj = tryParseJson(message.data.toString());
  if(! messageObj)
    return console.log("townHallMessageHandler received non-parsable message, ", messageString);
  
  const handlerFunction = rpcDirectHandler[messageObj.type];
  try {
      if(typeof handlerFunction == 'function'){
      handlerFunction({from:message.from, guid:message.guid, messageObj});
      return
    }
    else{
      return console.log("townHallMessageHandler received unknown type message object,", messageObj );
    }
  }
  catch(e){
    return console.error('executing handlerFunction inside townhall has exception:', e);
  }
}

exports.rpcResponseWithNewRequest = (room)=>(args)=>{
  const {sendToPeerId, message, guid, responseCallBack, err} = args;
  room.rpcResponseWithNewRequest(sendToPeerId, message, guid, responseCallBack, err);
}
exports.rpcRequest = (room)=>(args)=>{
  const {sendToPeerId, message, responseCallBack} = args;
  // sendToPeerId:tx.ipfsPeerId, 
  // message:JSON.stringify(raReqObj), 
  // responseCallBack:handleRaResponse
  room.rpcRequest(sendToPeerId, message, responseCallBack);

}

exports.rpcResponse =  (room)=>(args)=>{
  const {sendToPeerId, message, guid, err} = args;
  //o('debug', 'inside exports.rpcResponse:', sendToPeerId, message, guid, err);
  room.rpcResponse(sendToPeerId, message, guid, err);
}

const rpcDirectHandler = {
  reqUserInfo: ({from, guid})=>{
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
  simulatorRequestAction: async ({from, guid, messageObj})=>{

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
      await global.nodeSimCache.computeTaskPeersMgr.assignSpecialRoleToTask(cid, global.userInfo.userName);
    }
    global.broadcastEvent.emit('taskRoom', JSON.stringify({txType, cid}));
    global.rpcEvent.emit('rpcResponse', {
      sendToPeerId: from, 
      message : JSON.stringify({result:"OK"}), 
      guid : guid});

    console.log("send back to simulatorRequestAction requestor:")
  },
  reqRemoteAttestation: async ({from, guid, messageObj})=>{//Now I am new node, sending back poT after validate the remote attestation is real
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

  reqTaskParams: ({from, guid, messageObj})=>{
    console.log('I have got a request for reqTaskParams, messageObj', messageObj);
    
    const mayDelayExecuteDueToBlockDelay = (messageObj)=>{
      const {taskCid, blockHeight} = messageObj;
      if(blockHeight <= global.blockMgr.getLatestBlockHeight()){
        //this node is slower than the executor who send me the request. I have to wait till I have such a block to continue;
        try{
          if( global.nodeSimCache.computeTaskPeersMgr.getExecutorPeer(taskCid) != from){
            o('log', `Executor validate fail`);
            return;
          }
          const resTaskParams = {
            type:'resTaskParams',
            data:['Hello', " World!"],
            taskCid
          };
          global.rpcEvent.emit('rpcResponse', {
            sendToPeerId: from, 
            message : JSON.stringify(resTaskParams), 
            guid
          });
          
          o('log', `Sending response for Task data back to executor.`, resTaskParams);
        }
        catch(e){
          o('error', 'reqTaskParams handler has exception:', e);
          global.rpcEvent.emit('rpcResponse', {
            sendToPeerId: from, 
            message : null, 
            guid,
            err:e.toString()
          });
          
        }
        
      }else{
        global.blockMgr.reRunFunctionWhenNewBlockArrive(mayDelayExecuteDueToBlockDelay, messageObj);
        
      }
    }
    mayDelayExecuteDueToBlockDelay(messageObj)
    
  },
  reqLambdaParams: ({from, guid, messageObj})=>{
    console.log('I have got a request for Lambda Params reqLambdaParams, messageObj', messageObj);
    const mayDelayExecuteDueToBlockDelay = (messageObj)=>{
      
      const {taskCid, blockHeight} = messageObj;
      if(blockHeight <= global.blockMgr.getLatestBlockHeight()){
        try{
          if( global.nodeSimCache.computeTaskPeersMgr.getExecutorPeer(taskCid) != from){
            o('log', `Executor validate fail`);
            return;
          }
          const resLambdaParams = {
            type:'resLambdaParams',
            code:'args[0] + args[1]',
            taskCid
          };
          global.rpcEvent.emit('rpcResponse', {
            sendToPeerId: from, 
            message : JSON.stringify(resLambdaParams), 
            guid,
          });
          o('log', `Sending response for Lambda Params back to executor.`, resLambdaParams);
        }
        catch(e){
          o('error', 'reqLambdaParams handler has exception:', e);
          global.rpcEvent.emit('rpcResponse', {
            sendToPeerId: from, 
            message : null, 
            guid,
            err:e.toString()
          });
        }
      }else{
        global.blockMgr.reRunFunctionWhenNewBlockArrive(mayDelayExecuteDueToBlockDelay, messageObj);
      }
    }
    mayDelayExecuteDueToBlockDelay(messageObj);
    
  },
  reqVerifyPeerVrfForComputeTasks: ({from, guid, messageObj})=>{
    //o('debug', `I have got other peer sending me his vrf for compute task and ask mine. `, messageObj)

    const handleReqVerifyPeerReRunable = async (messageObj)=>{
      try{
        //o('debug', 'inside handleReqVerifyPeerReRunable', messageObj);
        if(messageObj.blockHeight > global.blockMgr.getLatestBlockHeight()){
          /******
           * 
           * This mean I have not receive the latest block while others send me the request. I have to wait to new block arrive and rerun this funciton
           */
          o('debug', 'I , ${global.userInfo.userName},  have not receive the latest block while others send me the request. I have to wait to new block arrive and rerun this funciton');
          global.blockMgr.reRunFunctionWhenNewBlockArrive(handleReqVerifyPeerReRunable, messageObj);
          return
        }
        
        
        if(typeof global.nodeSimCache.computeTaskPeersMgr.checkMyRoleInTask(messageObj.taskCid) == 'undefined'){
          o('error', `I, ${global.userInfo.userName},  am  not in the exeuction group of cid`, messageObj.taskCid);
          return global.rpcEvent.emit('rpcResponse', {
            sendToPeerId: from, 
            message : null, 
            guid,
            err:'I , ${global.userInfo.userName},  am not in the execution group. I should not receive this message. cid:' + messageObj.taskCid
          });
        }
        let validationResult = false;
        let otherPeerUserName;
        
        if(! validationResult){
          if(global.nodeSimCache.computeTaskPeersMgr.isPeerInGroup(from)){
            validationResult = true;
            otherPeerUserName = "already_in_my_group";
          }
        }
        const {taskCid, myVrfProofInfo:otherPeerVrfProofInfo, myRoleProofInfo: othersRoleProofInfo} = messageObj;
        
        if(validationResult == false){
          const block = await global.blockMgr.getLatestBlock();
          if(block.pendingTasks && block.pendingTasks[taskCid]){
            if(block.pendingTasks[taskCid].initiatorPeerId == from){
              validationResult = true;
              otherPeerUserName = 'taskOwner';
              global.nodeSimCache.computeTaskPeersMgr.setTaskOwnerPeer(taskCid, from);
            }
            else if(block.pendingTasks[taskCid].lambdaOwnerPeerId == from){
              validationResult = true;
              otherPeerUserName = 'lambdaOwner';
              global.nodeSimCache.computeTaskPeersMgr.setLambdaOwnerPeer(taskCid, from);
            }
            else
            validationResult = false;
          }
            
        }
        if(validationResult == false && otherPeerVrfProofInfo){
          console.assert(! othersRoleProofInfo , 'if we start to validate vrf, we shoudl be sure that othersRoleProofInfo is not existing');
          otherPeerUserName = otherPeerVrfProofInfo? otherPeerVrfProofInfo.userName: 'otherPeerVrfProofInfo_is_null';
          const blockCid = global.blockMgr.getBlockCidByHeight(otherPeerVrfProofInfo.blockHeightWhenVRF);
        
          const block = (await global.ipfs.dag.get(blockCid)).value;
          if(global.nodeSimCache.computeTaskPeersMgr.validateOtherPeerVrfProofInfo(taskCid, otherPeerVrfProofInfo, blockCid, block)){
            validationResult = true;
            global.nodeSimCache.computeTaskPeersMgr.addOtherPeerToMyExecutionPeers(taskCid, from, otherPeerVrfProofInfo);
            //o('debug', 'vdalite VRF successful.......')
          }else{
            o('debug', 'vrf validation failed too');
          }
        }
        if(validationResult == false){
          o('error', `Townhall handleReqVerifyPeerReRunable: Validate other peer ${from} information failed. I cannot add him to my list. In the future, I should report 
          this to Layer One because that peer could be a hacker trying to peek who is the VRF winner and plan DDoS attack. 
          At this moment, we do not do anything. In the future, one possible solution is to abort this whole process and do it again 
          after a pentalty to the possible hacker `);
          global.rpcEvent.emit('rpcResponse',{
            sendToPeerId: from,
            message: null,
            guid,
            err:`Response from ${global.userInfo.userName}: validating peer ${from} failed. I cannot add you ${otherPeerUserName}into my list`
          });
          
          return;
        }
        
        o('log', `I, ${global.userInfo.userName}, verified another peer ${otherPeerUserName} successfully. I have added him into my execution group`);
        
        
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
          case ComputeTaskRoles.executeGroupMember:
            resVerifyPeer.myVrfProofInfo = global.nodeSimCache.computeTaskPeersMgr.getMyVrfProofInfo(taskCid);
            break;
          default:
            throw "We have to have a role in the executeGroup, a taskOwner, lambdaOwner, or just executeGroupMember, cannot be nothing"
        }
        global.rpcEvent.emit('rpcResponse',{
          sendToPeerId: from,
          message: JSON.stringify(resVerifyPeer),
          guid
        });
        
        o('log', `I, ${global.userInfo.userName}, send back resVerifyPeerVrfForComputeTasks to ${from} ${guid} userName: ${otherPeerUserName}`);
      
      }
      catch(e){
        const err = 'reqVerifyPeerVrfForComputeTasks: exception inside handleReqVerifyPeerReRunable' + e.toString();
        o('error', err);
        global.rpcEvent.emit('rpcResponse',{
          sendToPeerId: from,
          message: null,
          guid,
          err
        });
        
      }
    }
    handleReqVerifyPeerReRunable(messageObj);

  },

  reqComputeCompleted: ({from, guid, messageObj})=>{
    const {taskCid, result} = messageObj;
    if( ComputeTaskRoles.taskOwner == global.nodeSimCache.computeTaskPeersMgr.checkMyRoleInTask(taskCid)){
      global.rpcEvent.emit('rpcResponse', {
        sendToPeerId: from, 
        message : JSON.stringify({feedback:"Great Job!"}), 
        guid
      });
      o('debug', `I am task Owner. I response executor's request back Great Job`);
      computeTaskOwnerConfirmationDone(taskCid);
      o('debug', 'done: computeTaskOwnerConfirmationDone');
    }
    else if(ComputeTaskRoles.executeGroupMember == global.nodeSimCache.computeTaskPeersMgr.checkMyRoleInTask(taskCid)){
      if(global.nodeSimCache.computeTaskPeersMgr.getExecutorName(taskCid) == global.userInfo.userName){
        /**** I am the executor, i do not need to handle this message */
      }else{
        global.rpcEvent.emit('rpcResponse', {
          sendToPeerId: from, 
          message : JSON.stringify({feedback:"Great Job!"}), 
          guid
        });
        o('debug', `I am monitor. I response executor's request back Great Job`);
      
        sendComputeTaskRaDone(taskCid);
      }
    }
    else{
      o('error', 'I should be the task owner to receive reqComputeCompleted reqeust, but I am not. Something must be wrong');
    }
    
  }
}

exports.messageHandler = (message)=>{
  const command = tryParseJson(message.data.toString());
  if(! command){
    o('debug', 'unhandled townhall message', message);
    return;
  }
  if(command.txType == 'debug_showPeerMgr'){
    global.nodeSimCache.computeTaskPeersMgr.debugOutput();
  }
  else{
    o('debug', 'unhandled townhall message', message);
  }
}

