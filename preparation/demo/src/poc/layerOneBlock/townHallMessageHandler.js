import {tryParseJson} from '../constValue';

export default (ipfs, room, options)=>{
  return (m)=>{
    const {globalState} = options;
    const messageString = m.data.toString();
    const messageObj = tryParseJson(messageString);
    if(! messageObj)
      return console.log("townHallMessageHandler received non-parsable message, ", messageString);
    switch(messageObj.type){
      
      default:
        return console.log("townHallMessageHandler received unknown type message object,", messageObj );
    }
  }
};

