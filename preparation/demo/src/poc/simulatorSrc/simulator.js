const getUrlVars = ()=>{
  const vars = {};
  const decodedUri = decodeURI(window.location.href);
  const parts = decodedUri.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m,key,value) =>{
      vars[key] = value;
  });
  return vars;
}

const main = ()=>{
  const userName = getUrlVars().u;
  const randRoomPostfix = getUrlVars().r || "";
  const pubicKey = getUrlVars().pub || "";
  const privateKey = getUrlVars().pri || "";
  document.read

  document.getElementById('roomPostfix').innerText = randRoomPostfix;
  document.getElementById('userName').innerText = userName;
  document.getElementById('pubkey').innerText = pubicKey;
  document.getElementById('privkey').innerText = privateKey;
  
}

document.addEventListener("DOMContentLoaded", main);