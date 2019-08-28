import autoBind from 'auto-bind';
export default class {
  constructor(){
    this._peerMap = {};
    this._userMap = {};
    autoBind(this);
  }

  put(peerId, userName, payload){
    if(this._peerMap[peerId] ){
      throw "peerId exists. Please remove first";
    }
    if(this._userMap[userName]){
      throw "userName exists. Please remove first";
    }
    this._peerMap[peerId] = {peerId, userName, payload};
    this._userMap[userName] = {peerId, userName, payload};

  }
  getByUserName(userName){
    return this._userMap[userName];
  }
  getByPeerId(peerId){
    return this._peerMap[peerId];
  }
  removeByUserName(userName){
    const item = this.getByUserName(userName);
    if(! item) return;
    delete this._userMap[userName];
    delete this._peerMap[item.peerId];
  }
  removeByPeerId(peerId){
    const item = this.getByPeerId(peerId);
    if(! item) return;
    delete this._peerMap[peerId];
    delete this._userMap[item.userName];
  }
}