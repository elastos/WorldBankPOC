
import {minimalNewNodeJoinRaDeposit} from '../constValue';
import {tryParseJson, logToWebPage} from './utils'
import {sha256} from 'js-sha256';
import { ecvrf, sortition} from 'vrf.js';
import Big from 'big.js';

exports.sendRemoteAttestationRequest = async ({tx, options, j, proof, value, blockCid, taskCid, publicKey})=>{
  const newNodeIpfsPeerId = tx.value.ipfsPeerId;
  const newNodeUserName = tx.value.userName;
  if(tx.value.depositAmt < 10){
    console.log(`The new node did not pay enough gas to do the RA, he has paid ${tx.value.depositAmt}. Remote attestation abort now`);
    return false;
  }
  const raReqObj = {
    type:'reqRemoteAttestation',
    j:parseInt(j.toFixed()), 
    proof: proof.toString('hex'), 
    value: value.toString('hex'),
    blockCid,
    taskCid,
    publicKey
  }
  window.rooms.townHall.sendTo(newNodeIpfsPeerId, JSON.stringify(raReqObj));
  logToWebPage(`Sending townhall request to the new node: ${newNodeIpfsPeerId}  for RA:`, raReqObj);
}



exports.validateVrf = async ({ipfs, remoteAttestatorPeerId, messageObj})=>{
  const {j, proof, value, blockCid, taskCid, publicKey} = messageObj;
  if(!j || !proof || !value || !blockCid || !taskCid || !publicKey){
    return {result:false, reason:`The incoming message missing some properties,`, messageObj};
  }
  const block = (await ipfs.dag.get(blockCid)).value;

  let totalCreditForOnlineNodes = 0;
  for( const c in block.trustedPeerToUserInfo){
    const currUserInfo = block.trustedPeerToUserInfo[c];
    totalCreditForOnlineNodes += block.creditMap[currUserInfo.userName];
  }
  const vrfMsg = sha256.update(blockCid).update(taskCid).hex();
  
  const p = 5 / totalCreditForOnlineNodes;

  const remoteAttestatorUserInfo = block.trustedPeerToUserInfo[remoteAttestatorPeerId];
  
  const vrfVerifyResult = ecvrf.verify(Buffer.from(publicKey, 'hex'), Buffer.from(vrfMsg, 'hex'), Buffer.from(proof, 'hex'), Buffer.from(value, 'hex'));
  if(! vrfVerifyResult){
    return {result: false, reason:'VRF verify failed'};
  }
  const remoteAttestatorCreditBalance = block.creditMap[remoteAttestatorUserInfo.userName];
  console.log('remoteAttestatorCreditBalance', remoteAttestatorCreditBalance);
  const jVerify = sortition.getVotes(Buffer.from(value, 'hex'), new Big(remoteAttestatorCreditBalance), new Big(p));
  if(jVerify.toFixed() != j){
    console.log("vrf soritition failed,", jVerify.toFixed());
    return {result: false, reason:'VRF Sortition failed'  + jVerify.toFixed()};
  }
  return {result:true};
};

exports.validatePot = (proofOfTrust)=>{
  const {psrData, isHacked, tpmPublicKey} = proofOfTrust;

  return ! isHacked;
}

exports.verifyOthersRemoteAttestationVrfAndProof = (messageObj)=>{
  console.log("verifyOthersRemoteAttestationVrfAndProof  not implemented yet, just return true for now")
  return true;//not implemented yet
}