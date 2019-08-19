import {getUrlVars} from './utils.js';

exports.main = ({userInfo})=>{
  const {userName, pubicKey, privateKey, randRoomPostfix} = userInfo;
  document.getElementById('roomPostfix').innerText = randRoomPostfix;
  document.getElementById('userName').innerText = userName;
  document.getElementById('pubkey').innerText = pubicKey;
  
  const ipfs = window.ipfs;
  const pubsubRooms = window.rooms;

  document.getElementById('ipfsPeerId').innerHTML = pubsubRooms.townHall.getMyPeerId();
  
  var container = document.getElementById("jsoneditor");
  var editor = new JSONEditor(container, {});

  document.getElementById('btn1').onclick = ()=>{
    editor.set({
      txType:"gasTransfer",
      fromPeerId: userName,
      toPeerId:"user #0",
      amt:15
    })
  }
  document.getElementById('btn2').onclick = ()=>{
    editor.set({
      txType:"newNodeJoinNeedRa",
      userName,
      depositAmt:10,
      ipfsPeerId:pubsubRooms.taskRoom.getMyPeerId()
    })
  };
  document.getElementById('btn3').onclick = ()=>{
    editor.set({
      txType:"computationTask",
      cid:""
    })
  };
  document.getElementById('btn4').onclick = ()=>{
    editor.set({
      txType:"placeHolder"
    })
  };
  document.getElementById('sendAction').onclick = ()=>{
    console.log("ready to send action,",JSON.stringify(editor.get(), null, 2));
    const jsonObj = editor.get();
    const txType = jsonObj.txType;
    try{
      let channelRoom;
      let cid;
      const broadcastObj = {txType};
      let promiseCid;
      switch(txType){
        case "gasTransfer":{
          channelRoom = pubsubRooms.taskRoom;
          const {fromPeerId, toPeerId, amt} = jsonObj;
          promiseCid = ipfs.dag.put({
            fromPeerId, toPeerId, amt
          });
          
          break;
        }
        case "placeHolder":
          channelRoom = pubsubRooms.townHall;
          break;
        case "newNodeJoinNeedRa":{
          channelRoom = pubsubRooms.taskRoom;

          promiseCid = ipfs.dag.put(jsonObj);
          
          break;
        }
  
        case "blockroom":
          channelRoom = pubsubRooms.blockRoom;
          break;
        default:
          return console.log("unsupported pubsub room,", room);
      }
      promiseCid.then((cid)=>{
        broadcastObj.cid = cid.toBaseEncodedString();
        channelRoom.broadcast(JSON.stringify(broadcastObj));
        console.log("Sent action: ",JSON.stringify(broadcastObj));
      }) 
      .catch((e)=>{
        throw e;
      })

    }
    catch(e){
      console.log("inside sendActionToRoom, excpetion:", e);
    }
  };
};




  