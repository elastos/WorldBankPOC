export default (m, ipfs, room, globalState)=>{
  const messageString = m.data.toString();
  const messageObj = JSON.parse(messageString);
  if(messageObj.txType == "showGlobalState"){
    console.log("txType showGlobalState:", globalState);
  }else{
    console.log("townHallMessageHandler, ", messageObj);
  }
  
};