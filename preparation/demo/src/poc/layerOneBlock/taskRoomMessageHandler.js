export default (ipfs, room, options)=>{
  return (m)=>{
    const {globalState} = options;
    const messageString = m.data.toString();

    const messageObj = JSON.parse(messageString);
    if(messageObj.txType == "gasTransfer"){
      globalState.txPool.push(messageObj.cid);
      
    }else{
      console.log("taskRoom Unhandled message, ", messageObj);
    }
  
  }
  
};