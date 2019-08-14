const {presetUsers} = require('../constValue');

const getUrlVars = ()=>{
  const vars = {};
  const parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m,key,value) =>{
      vars[key] = value;
  });
  return vars;
}
const userIndex = parseInt(getUrlVars().u || '1');
const randRoomPostfix = getUrlVars().r || "";
const user = presetUsers[userIndex];
console.log("User logged in as:", user);

document.getElementById('roomPostfix').innerText = randRoomPostfix;
document.getElementById('roomPostfix2').innerText = randRoomPostfix;
document.getElementById('userName').innerText = user.name;
document.getElementById('pubkey').innerText = user.pub;
document.getElementById('privkey').innerText = user.pri;
