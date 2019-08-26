import {tryParseJson} from '../constValue';

import {log} from '../PotLog';

exports.join = (ipfs, room, options)=>{
  return (peer)=>{
    //console.log("someone Joined townhall, asking its userinfo now ", peer);
    const reqObj = {
      type:'reqUserInfo'
    }
    //room.sendTo(peer, JSON.stringify(reqObj));
    room.rpcRequest(peer, JSON.stringify(reqObj), (res, err, withNewRequestGuid)=>{
      console.log("finally I got the rpcResponse like this,", res, err, withNewRequestGuid);
      if(err){
        return console.log('reqUserInfo response error', err);
      }
      const {userInfo} = res;
      const {globalState} = options;
      globalState.trustedPeerToUserInfo[peer] = userInfo;
      //console.log("trustedPeerToUserInfo, ", globalState.trustedPeerToUserInfo);

      log('user_online', {
        name : userInfo.userName,
        ipfs_id :peer
      });
      if(withNewRequestGuid){
        const r = {name:'Hello World'};
        room.rpcResponse(peer, JSON.stringify(r), withNewRequestGuid);
      }
    })
  }
};


exports.left = (ipfs, room, options)=>{
  return (peer)=>{
    //console.log("someone left townhall, we will remove this peer from globalState.trustedPeerToUserInfo if it exists there", peer);

    if(options.globalState.trustedPeerToUserInfo[peer]){
      log('user_offline', {
        name : options.globalState.trustedPeerToUserInfo[peer].userName,
        ipfs_id : peer
      });
    }
    
    delete options.globalState.trustedPeerToUserInfo[peer];
    //console.log("trustedPeerToUserInfo, ", options.globalState.trustedPeerToUserInfo);
  }
};
