import {tryParseJson} from '../constValue';
exports.join = (ipfs, room, options)=>{
  return (peer)=>{
    console.log("someone Joined townhall, asking its userinfo now ", peer);
    const reqObj = {
      type:'reqUserInfo'
    }
    room.sendTo(peer, JSON.stringify(reqObj));
  }
};


exports.left = (ipfs, room, options)=>{
  return (peer)=>{
    console.log("someone left townhall, we will remove this peer from globalState.trustedPeerToUserInfo if it exists there", peer);
    delete options.globalState.trustedPeerToUserInfo[peer];
    console.log("trustedPeerToUserInfo, ", options.globalState.trustedPeerToUserInfo);
  }
};
