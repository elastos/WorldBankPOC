import {tryParseJson} from '../shared/constValue';

const log = ()=>{};
exports.join = (ipfs, room, options, presetUsers)=>{
  return (peer)=>{
    //console.log("someone Joined townhall, asking its userinfo now ", peer);
    if(peer == ipfs._peerInfo.id.toB58String()){
      console.log("this is myself. PeerId:", peer);
      return;
    }
    const reqObj = {
      type:'reqUserInfo'
    }
    //room.sendTo(peer, JSON.stringify(reqObj));
    room.rpcRequest(peer, JSON.stringify(reqObj), (res, err, withNewRequestGuid)=>{
      console.log("finally I got the rpcResponse like this,", res, err, withNewRequestGuid);
      if(err){
        return console.log('reqUserInfo response error', err);
      }
      const {userInfo, type} = res;
      console.log('userInfo, type', userInfo, type);
      if(userInfo){
        global.onlinePeerUserCache.put(peer, userInfo.userName, userInfo);
      
        log('user_online', {
          name : userInfo.userName,
          ipfs_id :peer
        });
        
      }else if(type == 'requestRandomUserInfo'){
        
        if(withNewRequestGuid){
          const firstOffLineUser = presetUsers.find((u)=>{
            return ! global.onlinePeerUserCache.getByUserName(u.name);
          
          })
          room.rpcResponse(peer, JSON.stringify({userInfo:firstOffLineUser}), withNewRequestGuid);
          global.onlinePeerUserCache.put(peer, firstOffLineUser.name);
        }else{
          console.error("peer ask for requestRandomUserInfo but did not send me the callback function 'withNewRequestGuid'");
        }
      }else{
        console.error('did not got userInfo, peer did not ask randomuserINfo either, do not know how to handle')
      }
    })
  }
};


exports.left = (ipfs, room, options)=>{
  return (peer)=>{
    const userName = global.onlinePeerUserCache.getByPeerId(peer);
    global.onlinePeerUserCache.removeByPeerId(peer);
    
    log('user_offline', {
      name : userName,
      ipfs_id : peer
    });
  }
};
