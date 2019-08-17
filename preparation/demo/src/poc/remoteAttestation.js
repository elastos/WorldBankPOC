
import {minimalNewNodeJoinRaDeposit, expectNumberOfRemoteAttestatorsToBeVoted} from './constValue';
import {tryParseJson, logToWebPage} from './simulatorSrc/utils'
import {sha256} from 'js-sha256';
import { ecvrf, sortition} from 'vrf.js';
import Big from 'big.js';


exports.validateVrf = async ({ipfs, messageObj})=>{
  const {j, proof, value, blockCid, taskCid, publicKey, userName} = messageObj;
  if(!j || !proof || !value || !blockCid || !taskCid || !publicKey){
    return {result:false, reason:`The incoming message missing some properties,`, messageObj};
  }
  const block = (await ipfs.dag.get(blockCid)).value;

  const totalCreditForOnlineNodes = block.totalCreditForOnlineNodes;

  const vrfMsg = sha256.update(blockCid).update(taskCid).hex();
  
  const p = expectNumberOfRemoteAttestatorsToBeVoted / totalCreditForOnlineNodes;
  
  const vrfVerifyResult = ecvrf.verify(Buffer.from(publicKey, 'hex'), Buffer.from(vrfMsg, 'hex'), Buffer.from(proof, 'hex'), Buffer.from(value, 'hex'));
  if(! vrfVerifyResult){
    return {result: false, reason:'VRF verify failed'};
  }
  const remoteAttestatorCreditBalance = block.creditMap[userName];
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

