import {o, done} from '../shared/utilities';
import {expectNumberOfRemoteAttestatorsToBeVoted, minimalNewNodeJoinRaDeposit, expectNumberOfExecutorGroupToBeVoted} from '../shared/constValue';
import Big from 'big.js';
import {sha256} from 'js-sha256';
const {ecvrf, sortition} = require('vrf.js');
import {validatePot} from '../shared/remoteAttestation';
const updateLog = ()=>{};//Hi Jacky, just place holder here.

exports.handleProccessedTxs = async ({height : eventTriggeredBlockHeight, cid:eventTriggeredBlockCid})=>{
   
  
  const {userInfo} = global;
  if(! userInfo){
    o('log', 'userInfo is not initialized yet. Probably new block comes before "requestUserInfo" in the townHallJoinHandler. we will skip this block, waiting for next');
    return;
  }

  const block = await global.blockMgr.getBlockByHeight(eventTriggeredBlockHeight);
  o('assert', ()=>{
    block.height == eventTriggeredBlockHeight
  }, 'receive new block but height is different than the blockRoom broadcasted');

  const newNodeJoinNeedRaTxsCid = [];
  const remoteAttestationDoneTxsCid = [];
  const uploadLambdaTxsCid = [];
  const computeTaskTxsCid = [];
  const computeTaskWinnerApplicationCid = [];

  block.processedTxs.forEach((tx)=>{
    if(tx.txType == 'newNodeJoinNeedRa')  newNodeJoinNeedRaTxsCid.push(tx.cid);
    if(tx.txType == 'remoteAttestationDone')  remoteAttestationDoneTxsCid.push(tx.cid);
    if(tx.txType == 'uploadLambda')  uploadLambdaTxsCid.push(tx.cid);
    if(tx.txType == 'computeTask')  computeTaskTxsCid.push(tx.cid);
    if(tx.txType == 'computeTaskWinnerApplication') computeTaskWinnerApplicationCid.push(tx.cid);
  });
  newNodeJoinNeedRaTxsCid.map(async (txCid)=>{
    const tx = (await global.ipfs.dag.get(txCid)).value;
    const userInfo = global.userInfo;
    const reqRaObj = handleNewNodeJoinNeedRaTxs({block, blockCid: eventTriggeredBlockCid, totalCreditForOnlineNodes: block.totalCreditForOnlineNodes, tx, txCid, userInfo});
    const handleRaResponse = async (res, err)=>{
      if(err){
        o('log', `I am a Remote Attestator, I received new node's error response :, err is `, err);
        return console.log(`I am a Remote Attestator, I received new node's error response :, err is `, err);
      }
      o('log',`I am a Remote Attestator, I received new node's reply :, payload is `, res);
      const {proofOfVrf, proofOfTrust} = res;
      const potResult = validatePot(proofOfTrust);
      o('log', `Proof of trust verify result: ${potResult}`);
      const cid = await global.ipfs.dag.put({potResult,proofOfTrust,proofOfVrf});
      const remoteAttestationDoneMsg = {
        txType:'remoteAttestationDone',
        cid: txCid
      }
      global.broadcastEvent.emit('taskRoom', JSON.stringify(remoteAttestationDoneMsg));
      o('log', `Broadcast in taskRoom about the Proof of trust verify result: ${potResult}`);
    
      updateLog('res_ra', {
        name : userInfo.userName,
        from : tx.ipfsPeerId,
        cid : proofOfVrf.taskCid,
        potResult
      });
    }
    if(reqRaObj){
        global.rpcEvent.emit('rpcRequest', {
          sendToPeerId:tx.ipfsPeerId, 
          message:JSON.stringify(reqRaObj), 
          responseCallBack:handleRaResponse
        });
        o('log', `Sending townhall request to the new node: ${tx.ipfsPeerId}  for RA:`, reqRaObj);
      }
  });
  
  // remoteAttestationDoneTxsCid.map((cid)=>{
  //   options.ipfs.dag.get(cid).then(tx=>{
  //     console.log("received a RADone task, not implemented yet",tx.value);
  //     //logToWebPage(`Blockroom Received a RA Done Message `, tx);
  //   })
  // });

  // uploadLambdaTxsCid.map((cid)=>{
  //   console.log("for upload Lamdba, we do not need to do anything. Just have a record there that in which block height, the CID of this ladba has been recorded. In case of some future search")
  // });
  
  // computeTaskTxsCid.map(async (cid)=>{
  //   const tx = await ipfs.dag.get(cid);
  //   const {userName, depositAmt, executorRequirement, lambdaCid} = tx.value;
  //   if(userName == userInfo.userName){
  //     console.log("I am the task owner myself, I cannot do execution compute task on myself, skip");
  //     return;
  //   }
  //   const lambda = (await ipfs.dag.get(lambdaCid)).value;
  //   if(lambda.ownerName == userInfo.userName){
  //     console.log("I am the lambda owner myself, I cannot do execution compute task because I wrote the code, skip");
  //     return;
  //   }

  //   if(depositAmt < 0){
  //     console.log(`amt has to be greater than 0, otherwise he is stealing money from you: ${tx.value.depositAmt}. computTask abort now`);
  //     logToWebPage(`amt has to be greater than 0, otherwise he is stealing money from you: ${tx.value.depositAmt}. computTask abort now`);
  //     return;
  //   }
  //   const myCurrentGasBalance = options.block.gasMap[options.userInfo.userName];
    
  //   if ( myCurrentGasBalance < depositAmt){
  //     logToWebPage("I do not have enough gas as escrow to start this compute task. I have to quit this competition. Sorry. ")
  //     return;
  //   }
  //   const myCurrentCreditBalance = options.block.creditMap[options.userInfo.userName];
  //   if ( myCurrentCreditBalance < executorRequirement.credit){
  //     logToWebPage(`My credit balance is ${myCurrentCreditBalance} which is lower than the task client required ${executorRequirement.credit}. I have to quit this competition. Sorry. `);
  //     return;
  //   }
  //   const {blockCid} = options;
  //   //console.log("received a RA task",tx.value, blockCid, cid);
  //   const vrfMsg = sha256.update(blockCid).update(cid).hex();
  //   const p = expectNumberOfExecutorGroupToBeVoted / block.totalCreditForOnlineNodes;
  //   console.log("VRFing.... this takes some time, please be patient..., ", userInfo, vrfMsg);
  //   const { proof, value } = ecvrf.vrf(Buffer.from(userInfo.publicKey, 'hex'), Buffer.from(userInfo.privateKey, 'hex'), Buffer.from(vrfMsg, 'hex'));
  //   console.log("VRF{ proof, value }", { proof:proof.toString('hex'), value: value.toString('hex') });
  //   console.log("Now running VRF sortition...it also needs some time... please be patient...", userCreditBalance, p);
  //   const j = sortition.getVotes(value, new Big(userCreditBalance), new Big(p));
  //   if(j.gt(0)){
  //     console.log("I am lucky!!!", j.toFixed());
  //     logToWebPage(`I am lucky!! J is ${j.toFixed()}. However I should not tell anyone about my win. Do not want to get hacker noticed. I just join the secure p2p chat group for winner's only`);
  //     const applicationJoinSecGroup = {
  //       txType:'computeTaskWinnerApplication',
  //       ipfsPeerId: userInfo.ipfsPeerId,//peerId for myself
  //       userName: options.userInfo.userName,
  //       publicKey: options.userInfo.publicKey,
  //       taskCid: cid,
  //       proof:proof.toString('hex'),
  //       value: value.toString('hex'),
  //       j: j.toFixed(),
  //       blockHeightWhenVRF: options.block.blockHeight
  //     };
    
  //     //window.rooms.townHall.broadcast(JSON.stringify(applicationJoinSecGroup));
  //     window.rooms.taskRoom.broadcast(JSON.stringify(applicationJoinSecGroup));
    
  //     logToWebPage(`I am asking to join the secure chatting group by sending everyone in this group my application`, applicationJoinSecGroup);
      
  //   }else{
  //     // updateLog('req_ra_send', {
  //     //   name : userInfo.userName,
  //     //   j: parseInt(j.toFixed()),
  //     //   cid,
  //     // })

  //     console.log("bad luck, try next", j.toFixed());
  //     logToWebPage(`bad luck, try next time`);
  //   }
    
  // });

  // computeTaskWinnerApplicationCid.map(async (cid)=>{
    
  // })
}

const handleNewNodeJoinNeedRaTxs = ({block, blockCid, totalCreditForOnlineNodes, tx, txCid, userInfo})=>{
  const myCurrentCreditBalance = block.creditMap[userInfo.userName];
  const myCurrentGasBalance = block.gasMap[userInfo.userName];
  
  if(tx.userName == userInfo.userName){
    console.log("I am the node myself, I cannot do remote attestation on myself, skip");
    return;
  }
  if(tx.depositAmt < minimalNewNodeJoinRaDeposit){
    console.log(`The new node did not pay enough gas to do the RA, he has paid ${tx.depositAmt}. Remote attestation abort now`);
    return;
  }
      
  if ( myCurrentGasBalance < tx.depositAmt){
    o('log', "I do not have enough gas as escrow to start this remote attestation. I have to quit this competition. Sorry. ")
    return;
  }
  if ( myCurrentCreditBalance == 0){
    o('log', "My credit balance is 0. I have to quit this competition. Sorry. ");
    return;
  }
  const vrfMsg = sha256.update(blockCid).update(txCid).hex();

  const p = expectNumberOfRemoteAttestatorsToBeVoted / totalCreditForOnlineNodes;
  const { proof, value } = ecvrf.vrf(Buffer.from(userInfo.publicKey, 'hex'), Buffer.from(userInfo.privateKey, 'hex'), Buffer.from(vrfMsg, 'hex'));
  console.log("VRF{ proof, value }", { proof:proof.toString('hex'), value: value.toString('hex') });
  console.log("Now running VRF sortition...it also needs some time... please be patient...", myCurrentCreditBalance, p);
  const j = sortition.getVotes(value, new Big(myCurrentCreditBalance), new Big(p));
  if(j.gt(0)){
    console.log("I am lucky!!! J:", j.toFixed());
    const raReqObj = {
      type:'reqRemoteAttestation',
      j:parseInt(j.toFixed()), 
      proof: proof.toString('hex'), 
      value: value.toString('hex'),
      blockHeightWhenVRF: block.blockHeight,
      taskCid:txCid,
      publicKey:userInfo.publicKey,
      userName:userInfo.userName,
      blockCid
    }

    updateLog('req_ra_send', {
      name : userInfo.userName,
      j: parseInt(j.toFixed()),
      blockCid,
      cid:txCid,
      proof: proof.toString('hex')
    });
    return raReqObj;
    
  }else{
    updateLog('req_ra_send', {
      name : userInfo.userName,
      j: parseInt(j.toFixed()),
      cid:txCid,
    })

    console.log("bad luck, try next", j.toFixed());
    return null;
  }

}
exports.handleNewNodeJoinNeedRaTxs = handleNewNodeJoinNeedRaTxs;