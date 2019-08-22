import {getUrlVars, logToWebPage} from './utils.js';

exports.main = ({userInfo})=>{
  const {userName, publicKey, privateKey, randRoomPostfix} = userInfo;
  document.getElementById('roomPostfix').innerText = randRoomPostfix;
  document.getElementById('userName').innerText = userName;
  
  const ipfs = window.ipfs;
  const pubsubRooms = window.rooms;

  logToWebPage(`VRF Public Key: ${publicKey}`);
  
  logToWebPage(`IPFS PeerID: ${pubsubRooms.townHall.getMyPeerId()}`);
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
      ipfsPeerId:pubsubRooms.taskRoom.getMyPeerId(),

    })
  };
  document.getElementById('btn3').onclick = ()=>{
    editor.set({
      txType:'setProofOfTrustForThisNode',
      psrData:'placeholder',
      isHacked:true,
      tpmPublicKey:'placeholder'
    })
  };
  document.getElementById('btn4').onclick = ()=>{
    editor.set({
      txType:"uploadLambda",
      lambdaCid:"hello_world",
      dockerImg:"placeholder",
      payment:"payPerUse",
      amt:2
    });
  };
  document.getElementById('btn5').onclick = ()=>{
    editor.set({
      txType:"computeTask",
      userName,
      lambdaCid:"hello_world",
      postSecData:'placeholder',
      env:{
        network:'totalIsolated',
        ipAllowed:'none',
        p2pTrafficInAllowed:'owner',
        resultSendBackTo:'owner',
        errorSendBackTo:'owner',
        osRequirement:"none",
        timeOut:'100',
        cleanUpAfter:'totalWipeout'
      },
      executorRequirement:{
        credit:3,
        deposit:10

      },
      multiParties:'none',
      depositAmt:30
    });

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
        case "setProofOfTrustForThisNode":
          window.proofOfTrustTest = jsonObj;
          return;
        case "newNodeJoinNeedRa":
        case 'uploadLambda':
        case "computeTask":
          channelRoom = pubsubRooms.taskRoom;
          promiseCid = ipfs.dag.put(jsonObj);
          break;
        default:
          return console.log("unsupported sendAction txType,", txType);
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




  