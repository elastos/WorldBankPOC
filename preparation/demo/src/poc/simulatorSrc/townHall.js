import {tryParseJson, logToWebPage, updateLog} from './utils';
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


  const directMessageHandler = async (message) => {
    //console.log('In townhall got message from ' + message.from + ': ' + message.data.toString());
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
        room.sendTo(message.from, JSON.stringify(resMessage));
        //logToWebPage(`send back reqUserInfo to townhall manager`, resMessage);
        break;
      }

      case "reqRemoteAttestation":{//Now I am new node, sending back poT after validate the remote attestation is real
        const { j, proof, value, taskCid, publicKey, userName, blockHeightWhenVRF} = messageObj;
        const blockCid = options.blockHistory[blockHeightWhenVRF];
        const validateReturn = await validateVrf({ipfs, j, proof, value, blockCid, taskCid, publicKey, userName});

        if(! validateReturn.result){
          logToWebPage(`VRF Validation failed, reason is `, validateReturn.reason);
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

        room.sendTo(message.from, JSON.stringify(resRemoteAttestationObj));

        updateLog('req_ra', {
          name : options.userInfo.userName,
          vrf : true,
          cid : messageObj.taskCid,
          proofOfVrf: messageObj,
          proofOfTrust
        });
        
        logToWebPage(`send back resRemoteAttestation to the remote attestator ${message.from}, payload is `, resRemoteAttestationObj);
        break;
      }

      case "resRemoteAttestation":{//now, I am the remote attestator, validate new node
        logToWebPage(`I am a Remote Attestator, I received new node${message.from} 's reply :, payload is `, messageObj);
        const newNodePeerId = message.from;
        const {proofOfVrf, proofOfTrust} = messageObj;
        const potResult = validatePot(proofOfTrust);
        logToWebPage(`Proof of trust verify result: ${potResult}`);
        const cid = await ipfs.dag.put({potResult,proofOfTrust,proofOfVrf});
        const remoteAttestationDoneMsg = {
          txType:'remoteAttestationDone',
          cid: cid.toBaseEncodedString()
        }
        options.rooms.taskRoom.broadcast(JSON.stringify(remoteAttestationDoneMsg))
        logToWebPage(`Broadcast in taskRoom about the Proof of trust verify result: ${potResult}`);

        const {userInfo} = options;
        updateLog('res_ra', {
          name : userInfo.userName,
          from : message.from,
          cid : proofOfVrf.taskCid,
          potResult
        });
        
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
        const {taskCid,executor} = messageObj;
        const task = options.block.pendingTasks[taskCid];
        //console.log('task,', task);
        if(chooseExecutorAndMonitors(task).userName != executor.userName){
          logToWebPage(`Executor validate fail`, {executor, task});
          break;
        }
        const resTaskParams = {
          type:'resTaskParams',
          data:['Hello', " World!"],
          taskCid
        };
        room.sendTo(message.from, JSON.stringify(resTaskParams));
        logToWebPage(`Sending response for Task data back to executor.`, resTaskParams);
        break;
      }
      case 'reqLambdaParams':{
        //console.log('reqLambdaParams, messageObj', messageObj);
        const {taskCid,executor} = messageObj;
        const task = options.block.pendingTasks[taskCid];
        //console.log('task,', task);
        if(chooseExecutorAndMonitors(task).userName != executor.userName){
          logToWebPage(`Executor validate fail`, {executor, task});
          break;
        }
        const resLambdaParams = {
          type:'resLambdaParams',
          code:'args[0] + args[1]',
          taskCid
        };
        room.sendTo(message.from, JSON.stringify(resLambdaParams));
        logToWebPage(`Sending response for Lambda Params back to executor.`, resLambdaParams);
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
        if(options.computeTaskBuffer[taskCid].code && options.computeTaskBuffer[taskCid].data){
          logToWebPage(`Executor has got both data and code, it can start execution`, options.computeTaskBuffer[taskCid])
          const result = executeComputeUsingEval(options.computeTaskBuffer[taskCid]);
          delete options.computeTaskBuffer[taskCid];
          logToWebPage( `Execution result:`, result);
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
        if(options.computeTaskBuffer[taskCid].code && options.computeTaskBuffer[taskCid].data){
          logToWebPage(`Executor has got both data and code, it can start execution`, options.computeTaskBuffer[taskCid])
          const result = executeComputeUsingEval(options.computeTaskBuffer[taskCid]);
          delete options.computeTaskBuffer[taskCid];
          logToWebPage( `Execution result:`, result);
        }
        break;
      }
      default:{
        return console.log("townHallMessageHandler received unknown type message object,", messageObj );
      } 
    }//switch
    
  };
    
  messageHandlers.push({
    message: 'message',
    handler: (m)=>directMessageHandler(m)
  });
  
  return messageHandlers;

};