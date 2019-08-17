import {tryParseJson, minimalNewNodeJoinRaDeposit} from '../constValue'


export default (ipfs, room, options)=>{
  return async (m)=>{
    const {globalState} = options;
    const messageString = m.data.toString();
    
    const messageObj = tryParseJson(messageString);
    if( typeof messageObj == "undefined") return false;
    let processResult;
    switch(messageObj.txType){
      case "gasTransfer":
        processResult = await gasTransferProcess(ipfs, room, options, messageObj.cid);
        break;
      case "newNodeJoinNeedRa":
        processResult = await newNodeJoinNeedRaProcess(ipfs, room, options, messageObj.cid);
        break;
      case "remoteAttestationDone":
        processResult = await remoteAttestationDoneProcess(ipfs, room, options, messageObj.cid);
        break;
      default:
        console.log("taskRoom Unhandled message, ", messageObj);
    }
    if(processResult){
      globalState.txPool.push(messageObj);
      console.log("after process tx cid=", messageObj.cid,  " the globalState is,", globalState);
    }
    else{
      console.log("process task failed, tx is dropped, ", messageObj.cid);
    }
  }
};

const gasTransferProcess = async (ipfs, room, options, cid)=>{
  const {globalState} = options;
  if(!cid) return false;
  const tx = await ipfs.dag.get(cid)

  if(!tx) return false;

  const {fromPeerId, toPeerId, amt} = tx.value;
  if (amt < 0)  return false;
  if (!fromPeerId || ! toPeerId || !amt)  return false;
  if( globalState && globalState.gasMap && globalState.gasMap[fromPeerId] && globalState.gasMap[fromPeerId] > amt)
  {
    globalState.gasMap[fromPeerId] -= amt;
    if(! globalState.gasMap[toPeerId])  globalState.gasMap[toPeerId] = amt;
    else globalState.gasMap[toPeerId] += amt;
    return true;
  }else{
    console.log("gasTransferProcess error tx.value, globalState,", tx.value, globalState);
    return false;
  };

}

const newNodeJoinNeedRaProcess = async (ipfs, room, options, cid)=>{
  const {globalState} = options;
  if(!cid) {
    console.log("in newNodeJoinNeedRaProcess, cid is not existing,", cid);
    return false
  };
  const tx = await ipfs.dag.get(cid)

  if(!tx){ 
    console.log("in newNodeJoinNeedRaProcess, tx is not existing", tx);
    return false;
  }

  const {userName, depositAmt} = tx.value;
  if (!userName)  return false;
  if (depositAmt < minimalNewNodeJoinRaDeposit){
    console.log("Please pay more deposit to get your new node verified. Minimal is,", minimalNewNodeJoinRaDeposit);
    return false;
  }
  
  if( globalState && globalState.gasMap && globalState.gasMap[userName] && globalState.gasMap[userName] > depositAmt)
  {
    globalState.gasMap[userName] -= depositAmt;
    if (! globalState.lockGasMap) globalState.lockGasMap = {};
    if (! globalState.lockGasMap[userName])  globalState.lockGasMap[userName] = depositAmt;
    else globalState.lockGasMap[userName] += depositAmt;
    
    return true;
  }else{
    console.log("newNodeJoinNeedRaProcess error tx.value, globalState,", tx.value, globalState);
    return false;
  };

}



const remoteAttestationDoneProcess = async (ipfs, room, options, cid)=>{
  const tx = await ipfs.dag.get(cid);
  if(! tx || ! tx.value){
    console.log("in remoteAttestationDoneProcess, tx is not existing", tx);
    return false;
  }
  const {potResult,proofOfTrust,proofOfVrf} = tx.value;
  
  console.log("remoteAttestationDone - Not impplemented yet");
  return false;
}