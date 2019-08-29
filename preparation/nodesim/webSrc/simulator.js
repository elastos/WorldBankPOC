
const main = ()=>{
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
      depositAmt:10

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
  document.getElementById('sendAction').onclick = async ()=>{
    //const userName = document.getElementById('userName').innerHTML;
    document.getElementById('initiatorResponse').innerHTML = "";
    document.getElementById('initiatorError').innerHTML = "";

    console.log("ready to send action,",JSON.stringify(editor.get(), null, 2));
    const jsonObj = editor.get();
    const warpper = {
      initiatorUserName: userName,
      action:jsonObj
    }
    const url = 'http://' + window.location.host + '/poc/action';
    console.log('url:', url);
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'same-origin', // no-cors, cors, *same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
          'Content-Type': 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrer: 'no-referrer', // no-referrer, *client
      body: JSON.stringify(warpper), // body data type must match "Content-Type" header
    });
    
    if(response.ok) {
      const result = await response.blob()
    
      document.getElementById('initiatorResponse').innerHTML = result;
    }
    else{
      document.getElementById('initiatorError').innerHTML = response.blob();
    }

    
  };
};
document.addEventListener('DOMContentLoaded', main);



  