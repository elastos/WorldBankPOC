import {getUrlVars} from './utils.js';

exports.main = ()=>{
  const userName = getUrlVars().u;
  const randRoomPostfix = getUrlVars().r || "";
  const pubicKey = getUrlVars().pub || "";
  const privateKey = getUrlVars().pri || "";
  document.read

  document.getElementById('roomPostfix').innerText = randRoomPostfix;
  document.getElementById('userName').innerText = userName;
  document.getElementById('pubkey').innerText = pubicKey;
  document.getElementById('privkey').innerText = privateKey;
  
  
  window.ipfs.id().then(({id})=>document.getElementById('ipfsPeerId').innerHTML = id);
    

}
