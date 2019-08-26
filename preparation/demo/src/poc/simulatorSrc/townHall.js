import {tryParseJson, logToWebPage, updateLog} from './utils';
import _ from 'lodash';
import {validateVrf, validatePot, verifyOthersRemoteAttestationVrfAndProof}  from '../remoteAttestation';
import {chooseExecutorAndMonitors, executeComputeUsingEval} from '../computeTask';


module.exports = (ipfs, room, {block, blockCid, blockHistory, userInfo}) => {
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
        const {userName, publicKey} = userInfo;

        const resMessage = {
          type:'resUserInfo',
          userInfo:{userName, publicKey}
        }
        room.rpcResponseWithNewRequest(message.from, JSON.stringify(resMessage), message.guid, (res, err)=>{
          if(err)
            console.log("rpcResponseWithNewRequest err,",err);
          else
            console.log('rpcResponseWithNewRequest received', res);
        });
        logToWebPage(`send back reqUserInfo to townhall manager using RPC response`, {resMessage, guid: message.guid});
        break;
      }

      case "reqRemoteAttestation":{//Now I am new node, sending back poT after validate the remote attestation is real
        const { j, proof, value, taskCid, publicKey, userName, blockHeightWhenVRF} = messageObj;
        const validateReturn = await validateVrf({ipfs, j, proof, value, blockCid:blockHistory[blockHeightWhenVRF], taskCid, publicKey, userName});

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
        if(messageObj.userName == userInfo.userName){
          //myself
          break;
        }
        const { j, proof, value, taskCid, publicKey, userName, blockHeightWhenVRF} = messageObj;
        const validateReturn = await validateVrf({ipfs, j, proof, value, blockCid: blockHistory[blockHeightWhenVRF], taskCid, publicKey, userName});
        if(! validateReturn.result){
          logToWebPage(`VRF Validation failed, reason is `, validateReturn.reason);
          break;
        }
        //logToWebPage(`VRF Validation passed`);
        
        break;
      }
      case "remoteAttestationDone":{
        
        break;
      }
      case 'reqTaskParams':{
        console.log('reqTaskParams, messageObj', messageObj);
        
        const mayDelayExecuteDueToBlockDelay = (messageObj)=>{
          const {taskCid,executor, blockHeight} = messageObj;
          if(blockHeight <= block.blockHeight){
            //this node is slower than the executor who send me the request. I have to wait till I have such a block to continue;
            
            const task = block.pendingTasks[taskCid];
            
            const calculateExecutor = chooseExecutorAndMonitors(task);
            if(! calculateExecutor){
              logToWebPage(`Cannot find executor`, {task, blockHeight:block.blockHeight});
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
            room.rpcResponse(message.from, JSON.stringify(resTaskParams), message.guid);
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
          if(blockHeight <= block.blockHeight){
            const {taskCid,executor} = messageObj;
            const task = block.pendingTasks[taskCid];
            console.log('task,', task);
            const calculateExecutor = chooseExecutorAndMonitors(task);
            if(! calculateExecutor){
              logToWebPage(`Cannot find executor`, {task , blockHeight:block.blockHeight});
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
            room.rpcResponse(message.from, JSON.stringify(resLambdaParams), message.guid);
            logToWebPage(`Sending response for Lambda Params back to executor.`, resLambdaParams);
          }else{
            _.delay(mayDelayExecuteDueToBlockDelay, 1000, messageObj);
          }
        }
        mayDelayExecuteDueToBlockDelay(messageObj);
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
  
  return messageHandlers;

};


