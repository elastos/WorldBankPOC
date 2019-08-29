
exports.main = ({userInfo, ipfs, rooms})=>{
  let userName = 'user #0';
  //document.getElementById('roomPostfix').innerText = randRoomPostfix;
  document.getElementById('userName').innerText = userName;
  
  
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
      ipfsPeerId:

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
      lambdaName:"hello_world",
      dockerImg:"placeholder",
      payment:"payPerUse",
      ownerName:userName,
      amt:2
    });
  };
  document.getElementById('btn5').onclick = ()=>{
    editor.set({
      txType:"computeTask",
      userName,
      lambdaCid:"PLEASE_REPLACE_THIS_VALUE_TO_THE_lambdaCid_YOU_GOT_FROM_PREVIOUS_uploadLambda_TASK",
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
      depositAmt:3
    });

  };
  document.getElementById('selectUser').onchange = ()=>{
    userName = document.getElementById('selectUser').value;
    document.getElementById('userName').innerHTML = userName; 
  }
  document.getElementById('sendAction').onclick = ()=>{
    //const userName = document.getElementById('userName').innerHTML;
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
          channelRoom = rooms.taskRoom;
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
          channelRoom = rooms.taskRoom;
          promiseCid = ipfs.dag.put(jsonObj);
          break;
        default:
          return console.log("unsupported sendAction txType,", txType);
      }
      promiseCid.then((cid)=>{
        broadcastObj.cid = cid.toBaseEncodedString();
        if(txType == 'uploadLambda'){
          logToWebPage(`Please record this CID number, you will need it when you submit a compute task using this Lamdba: ${broadcastObj.cid}`)
        }
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




  