import {tryParseJson} from '../shared/constValue';

export default (ipfs, room, options)=>{
  return async (m)=>{
    const {globalState} = options;
    const messageString = m.data.toString();

    const messageObj = tryParseJson(messageString);
    if(typeof messageObj == 'undefined') { 
      //console.log("Ignored bad new block message,", messageString);
      return;
      //throw new ExceptionHandler("bad new block messageString cannot get parse to JSON:" + messageString);
    }
    const {txType, cid} = messageObj;
    if(txType == "newBlock"){
      const newBlock = await ipfs.dag.get(cid);
      if(cid != options.globalState.blockCid){

        console.error("the new block is not the one server genreated!!!!!", cid, options.globalState.blockCid);
      }
      else{
        console.log("received new block, CID matches:", cid);
      }
      //console.log("Retreive block from IPFS:", newBlock);
      //console.log("Cid and Current globalState", cid, options.globalState.blockCid);
    }else{
      console.log("blockkRoom Unhandled message, ", messageObj);
    }
  }
};