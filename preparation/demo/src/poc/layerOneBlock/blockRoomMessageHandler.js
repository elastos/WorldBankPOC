export default (ipfs, room, options)=>{
  return (m)=>{
    const {globalState} = options;
    const messageString = m.data.toString();

    console.log("messageString,", messageString);
    const messageObj = JSON.parse(messageString);
    if(messageObj.txType == "newblock"){
      globalState.txPool.push(messageObj.cid);
      
    }else{
      console.log("blockkRoom Unhandled message, ", messageObj);
    }
  
  }
  
};