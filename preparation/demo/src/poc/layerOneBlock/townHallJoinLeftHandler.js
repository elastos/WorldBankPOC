import {tryParseJson} from '../constValue';
exports.join = (ipfs, room, options)=>{
  return (peer)=>{
    console.log("someone Joined townhall, ", peer);
  }
};


exports.left = (ipfs, room, options)=>{
  return (peer)=>{
    console.log("someone left townhall, ", peer);
  }
};
