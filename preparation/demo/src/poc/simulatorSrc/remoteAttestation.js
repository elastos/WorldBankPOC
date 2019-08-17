
import {minimalNewNodeJoinRaDeposit} from '../constValue';
import {tryParseJson, logToWebPage} from './utils'
exports.remoteAttestation = async ({tx, options, j, proof, value, blockCid, taskCid, publicKey})=>{
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
  window.rooms.taskRoom.sendTo(newNodeIpfsPeerId, JSON.stringify(raReqObj));
  logToWebPage(`Sending request to the new node: ${newNodeIpfsPeerId}  for RA: ${JSON.stringify(raReqObj)}`);
}