import {tryParseJson} from '../constValue';
export default (ipfs, room, options)=>{
  return (m)=>{
    const {globalState} = options;
    const messageString = m.data.toString();
    const messageObj = JSON.parse(messageString);
    console.log("townHallMessageHandler, ", messageObj);
  }
};

