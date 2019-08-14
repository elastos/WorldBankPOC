import {tryParseJson} from '../constValue'


export default (ipfs, room, options)=>{
  return async (m)=>{
    const {globalState} = options;
    const messageString = m.data.toString();
    try{
      const messageObj = tryParseJson(messageString);
      if( typeof messageObj == "undefined") return false;
      if(messageObj.txType == "gasTransfer"){
        if(await gasTransferProcess(ipfs, room, options, messageObj.cid)){
          globalState.txPool.push(messageObj.cid);
          console.log("after gas transfer, globalState is,", globalState);
          
        }
        else{
          //drop the tx since it cannot be handled or invalid
          console.log("gasTransfer tx has been dropped,", messageObj.cid);
        }
        
      }else{
        console.log("taskRoom Unhandled message, ", messageObj);
      }
    }
    catch(e){

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
    console.log("globalState error,", globalState);
    return false;
  };

}