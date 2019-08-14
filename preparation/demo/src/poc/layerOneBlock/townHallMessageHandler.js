export default (ipfs, room, options)=>{
  return (m)=>{
    const {globalState} = options;
    const messageString = m.data.toString();
    const messageObj = JSON.parse(messageString);
    if(messageObj.txType == "showGlobalState"){
      console.log("txType showGlobalState:", globalState);
    }else{
      console.log("townHallMessageHandler, ", messageObj);
    }
  }
};