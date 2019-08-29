(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

const main = () => {
  let userName = 'user #0'; //document.getElementById('roomPostfix').innerText = randRoomPostfix;

  document.getElementById('userName').innerText = userName;
  var container = document.getElementById("jsoneditor");
  var editor = new JSONEditor(container, {});

  document.getElementById('btn1').onclick = () => {
    editor.set({
      txType: "gasTransfer",
      fromUserName: userName,
      toUserName: "user #0",
      amt: 15
    });
  };

  document.getElementById('btn2').onclick = () => {
    editor.set({
      txType: "newNodeJoinNeedRa",
      userName,
      depositAmt: 10
    });
  };

  document.getElementById('btn3').onclick = () => {
    editor.set({
      txType: 'setProofOfTrustForThisNode',
      psrData: 'placeholder',
      isHacked: true,
      tpmPublicKey: 'placeholder'
    });
  };

  document.getElementById('btn4').onclick = () => {
    editor.set({
      txType: "uploadLambda",
      lambdaName: "hello_world",
      dockerImg: "placeholder",
      payment: "payPerUse",
      ownerName: userName,
      amt: 2
    });
  };

  document.getElementById('btn5').onclick = () => {
    editor.set({
      txType: "computeTask",
      userName,
      lambdaCid: "PLEASE_REPLACE_THIS_VALUE_TO_THE_lambdaCid_YOU_GOT_FROM_PREVIOUS_uploadLambda_TASK",
      postSecData: 'placeholder',
      env: {
        network: 'totalIsolated',
        ipAllowed: 'none',
        p2pTrafficInAllowed: 'owner',
        resultSendBackTo: 'owner',
        errorSendBackTo: 'owner',
        osRequirement: "none",
        timeOut: '100',
        cleanUpAfter: 'totalWipeout'
      },
      executorRequirement: {
        credit: 3,
        deposit: 10
      },
      multiParties: 'none',
      depositAmt: 3
    });
  };

  document.getElementById('selectUser').onchange = () => {
    userName = document.getElementById('selectUser').value;
    document.getElementById('userName').innerHTML = userName;
  };

  document.getElementById('sendAction').onclick = async () => {
    //const userName = document.getElementById('userName').innerHTML;
    document.getElementById('initiatorResponse').innerHTML = "";
    document.getElementById('initiatorError').innerHTML = "";
    console.log("ready to send action,", JSON.stringify(editor.get(), null, 2));
    const jsonObj = editor.get();
    const warpper = {
      initiatorUserName: userName,
      action: jsonObj
    };
    const url = 'http://' + window.location.host + '/poc/action';
    console.log('url:', url);
    const response = await fetch(url, {
      method: 'POST',
      // *GET, POST, PUT, DELETE, etc.
      mode: 'same-origin',
      // no-cors, cors, *same-origin
      cache: 'no-cache',
      // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin',
      // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json' // 'Content-Type': 'application/x-www-form-urlencoded',

      },
      redirect: 'follow',
      // manual, *follow, error
      referrer: 'no-referrer',
      // no-referrer, *client
      body: JSON.stringify(warpper) // body data type must match "Content-Type" header

    });

    if (response.ok) {
      const result = await response.blob();
      document.getElementById('initiatorResponse').innerHTML = result;
    } else {
      document.getElementById('initiatorError').innerHTML = response.blob();
    }
  };
};

document.addEventListener('DOMContentLoaded', main);

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3ZWJTcmMvc2ltdWxhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNDQSxNQUFNLElBQUksR0FBRyxNQUFJO0FBQ2YsTUFBSSxRQUFRLEdBQUcsU0FBZixDQURlLENBRWY7O0FBQ0EsRUFBQSxRQUFRLENBQUMsY0FBVCxDQUF3QixVQUF4QixFQUFvQyxTQUFwQyxHQUFnRCxRQUFoRDtBQUdBLE1BQUksU0FBUyxHQUFHLFFBQVEsQ0FBQyxjQUFULENBQXdCLFlBQXhCLENBQWhCO0FBQ0EsTUFBSSxNQUFNLEdBQUcsSUFBSSxVQUFKLENBQWUsU0FBZixFQUEwQixFQUExQixDQUFiOztBQUVBLEVBQUEsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsTUFBeEIsRUFBZ0MsT0FBaEMsR0FBMEMsTUFBSTtBQUM1QyxJQUFBLE1BQU0sQ0FBQyxHQUFQLENBQVc7QUFDVCxNQUFBLE1BQU0sRUFBQyxhQURFO0FBRVQsTUFBQSxZQUFZLEVBQUUsUUFGTDtBQUdULE1BQUEsVUFBVSxFQUFDLFNBSEY7QUFJVCxNQUFBLEdBQUcsRUFBQztBQUpLLEtBQVg7QUFNRCxHQVBEOztBQVFBLEVBQUEsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsTUFBeEIsRUFBZ0MsT0FBaEMsR0FBMEMsTUFBSTtBQUM1QyxJQUFBLE1BQU0sQ0FBQyxHQUFQLENBQVc7QUFDVCxNQUFBLE1BQU0sRUFBQyxtQkFERTtBQUVULE1BQUEsUUFGUztBQUdULE1BQUEsVUFBVSxFQUFDO0FBSEYsS0FBWDtBQU1ELEdBUEQ7O0FBUUEsRUFBQSxRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QixFQUFnQyxPQUFoQyxHQUEwQyxNQUFJO0FBQzVDLElBQUEsTUFBTSxDQUFDLEdBQVAsQ0FBVztBQUNULE1BQUEsTUFBTSxFQUFDLDRCQURFO0FBRVQsTUFBQSxPQUFPLEVBQUMsYUFGQztBQUdULE1BQUEsUUFBUSxFQUFDLElBSEE7QUFJ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OztBQUZLLE9BTHVCO0FBU2hDLE1BQUEsUUFBUSxFQUFFLFFBVHNCO0FBU1o7QUFDcEIsTUFBQSxRQUFRLEVBQUUsYUFWc0I7QUFVUDtBQUN6QixNQUFBLElBQUksRUFBRSxJQUFJLENBQUMsU0FBTCxDQUFlLE9BQWYsQ0FYMEIsQ0FXRDs7QUFYQyxLQUFOLENBQTVCOztBQWNBLFFBQUcsUUFBUSxDQUFDLEVBQVosRUFBZ0I7QUFDZCxZQUFNLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFULEVBQXJCO0FBRUEsTUFBQSxRQUFRLENBQUMsY0FBVCxDQUF3QixtQkFBeEIsRUFBNkMsU0FBN0MsR0FBeUQsTUFBekQ7QUFDRCxLQUpELE1BS0k7QUFDRixNQUFBLFFBQVEsQ0FBQyxjQUFULENBQXdCLGdCQUF4QixFQUEwQyxTQUExQyxHQUFzRCxRQUFRLENBQUMsSUFBVCxFQUF0RDtBQUNEO0FBR0YsR0FyQ0Q7QUFzQ0QsQ0EvR0Q7O0FBZ0hBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsSUFBOUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcbmNvbnN0IG1haW4gPSAoKT0+e1xuICBsZXQgdXNlck5hbWUgPSAndXNlciAjMCc7XG4gIC8vZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb21Qb3N0Zml4JykuaW5uZXJUZXh0ID0gcmFuZFJvb21Qb3N0Zml4O1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlck5hbWUnKS5pbm5lclRleHQgPSB1c2VyTmFtZTtcbiAgXG4gIFxuICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJqc29uZWRpdG9yXCIpO1xuICB2YXIgZWRpdG9yID0gbmV3IEpTT05FZGl0b3IoY29udGFpbmVyLCB7fSk7XG5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bjEnKS5vbmNsaWNrID0gKCk9PntcbiAgICBlZGl0b3Iuc2V0KHtcbiAgICAgIHR4VHlwZTpcImdhc1RyYW5zZmVyXCIsXG4gICAgICBmcm9tVXNlck5hbWU6IHVzZXJOYW1lLFxuICAgICAgdG9Vc2VyTmFtZTpcInVzZXIgIzBcIiwgXG4gICAgICBhbXQ6MTVcbiAgICB9KVxuICB9XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4yJykub25jbGljayA9ICgpPT57XG4gICAgZWRpdG9yLnNldCh7XG4gICAgICB0eFR5cGU6XCJuZXdOb2RlSm9pbk5lZWRSYVwiLFxuICAgICAgdXNlck5hbWUsXG4gICAgICBkZXBvc2l0QW10OjEwXG5cbiAgICB9KVxuICB9O1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuMycpLm9uY2xpY2sgPSAoKT0+e1xuICAgIGVkaXRvci5zZXQoe1xuICAgICAgdHhUeXBlOidzZXRQcm9vZk9mVHJ1c3RGb3JUaGlzTm9kZScsXG4gICAgICBwc3JEYXRhOidwbGFjZWhvbGRlcicsXG4gICAgICBpc0hhY2tlZDp0cnVlLFxuICAgICAgdHBtUHVibGljS2V5OidwbGFjZWhvbGRlcidcbiAgICB9KVxuICB9O1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuNCcpLm9uY2xpY2sgPSAoKT0+e1xuICAgIGVkaXRvci5zZXQoe1xuICAgICAgdHhUeXBlOlwidXBsb2FkTGFtYmRhXCIsXG4gICAgICBsYW1iZGFOYW1lOlwiaGVsbG9fd29ybGRcIixcbiAgICAgIGRvY2tlckltZzpcInBsYWNlaG9sZGVyXCIsXG4gICAgICBwYXltZW50OlwicGF5UGVyVXNlXCIsXG4gICAgICBvd25lck5hbWU6dXNlck5hbWUsXG4gICAgICBhbXQ6MlxuICAgIH0pO1xuICB9O1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuNScpLm9uY2xpY2sgPSAoKT0+e1xuICAgIGVkaXRvci5zZXQoe1xuICAgICAgdHhUeXBlOlwiY29tcHV0ZVRhc2tcIixcbiAgICAgIHVzZXJOYW1lLFxuICAgICAgbGFtYmRhQ2lkOlwiUExFQVNFX1JFUExBQ0VfVEhJU19WQUxVRV9UT19USEVfbGFtYmRhQ2lkX1lPVV9HT1RfRlJPTV9QUkVWSU9VU191cGxvYWRMYW1iZGFfVEFTS1wiLFxuICAgICAgcG9zdFNlY0RhdGE6J3BsYWNlaG9sZGVyJyxcbiAgICAgIGVudjp7XG4gICAgICAgIG5ldHdvcms6J3RvdGFsSXNvbGF0ZWQnLFxuICAgICAgICBpcEFsbG93ZWQ6J25vbmUnLFxuICAgICAgICBwMnBUcmFmZmljSW5BbGxvd2VkOidvd25lcicsXG4gICAgICAgIHJlc3VsdFNlbmRCYWNrVG86J293bmVyJyxcbiAgICAgICAgZXJyb3JTZW5kQmFja1RvOidvd25lcicsXG4gICAgICAgIG9zUmVxdWlyZW1lbnQ6XCJub25lXCIsXG4gICAgICAgIHRpbWVPdXQ6JzEwMCcsXG4gICAgICAgIGNsZWFuVXBBZnRlcjondG90YWxXaXBlb3V0J1xuICAgICAgfSxcbiAgICAgIGV4ZWN1dG9yUmVxdWlyZW1lbnQ6e1xuICAgICAgICBjcmVkaXQ6MyxcbiAgICAgICAgZGVwb3NpdDoxMFxuXG4gICAgICB9LFxuICAgICAgbXVsdGlQYXJ0aWVzOidub25lJyxcbiAgICAgIGRlcG9zaXRBbXQ6M1xuICAgIH0pO1xuXG4gIH07XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWxlY3RVc2VyJykub25jaGFuZ2UgPSAoKT0+e1xuICAgIHVzZXJOYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbGVjdFVzZXInKS52YWx1ZTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlck5hbWUnKS5pbm5lckhUTUwgPSB1c2VyTmFtZTsgXG4gIH1cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbmRBY3Rpb24nKS5vbmNsaWNrID0gYXN5bmMgKCk9PntcbiAgICAvL2NvbnN0IHVzZXJOYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJOYW1lJykuaW5uZXJIVE1MO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbml0aWF0b3JSZXNwb25zZScpLmlubmVySFRNTCA9IFwiXCI7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luaXRpYXRvckVycm9yJykuaW5uZXJIVE1MID0gXCJcIjtcblxuICAgIGNvbnNvbGUubG9nKFwicmVhZHkgdG8gc2VuZCBhY3Rpb24sXCIsSlNPTi5zdHJpbmdpZnkoZWRpdG9yLmdldCgpLCBudWxsLCAyKSk7XG4gICAgY29uc3QganNvbk9iaiA9IGVkaXRvci5nZXQoKTtcbiAgICBjb25zdCB3YXJwcGVyID0ge1xuICAgICAgaW5pdGlhdG9yVXNlck5hbWU6IHVzZXJOYW1lLFxuICAgICAgYWN0aW9uOmpzb25PYmpcbiAgICB9XG4gICAgY29uc3QgdXJsID0gJ2h0dHA6Ly8nICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyAnL3BvYy9hY3Rpb24nO1xuICAgIGNvbnNvbGUubG9nKCd1cmw6JywgdXJsKTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsIC8vICpHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBldGMuXG4gICAgICBtb2RlOiAnc2FtZS1vcmlnaW4nLCAvLyBuby1jb3JzLCBjb3JzLCAqc2FtZS1vcmlnaW5cbiAgICAgIGNhY2hlOiAnbm8tY2FjaGUnLCAvLyAqZGVmYXVsdCwgbm8tY2FjaGUsIHJlbG9hZCwgZm9yY2UtY2FjaGUsIG9ubHktaWYtY2FjaGVkXG4gICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJywgLy8gaW5jbHVkZSwgKnNhbWUtb3JpZ2luLCBvbWl0XG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAvLyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICB9LFxuICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLCAvLyBtYW51YWwsICpmb2xsb3csIGVycm9yXG4gICAgICByZWZlcnJlcjogJ25vLXJlZmVycmVyJywgLy8gbm8tcmVmZXJyZXIsICpjbGllbnRcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHdhcnBwZXIpLCAvLyBib2R5IGRhdGEgdHlwZSBtdXN0IG1hdGNoIFwiQ29udGVudC1UeXBlXCIgaGVhZGVyXG4gICAgfSk7XG4gICAgXG4gICAgaWYocmVzcG9uc2Uub2spIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLmJsb2IoKVxuICAgIFxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luaXRpYXRvclJlc3BvbnNlJykuaW5uZXJIVE1MID0gcmVzdWx0O1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luaXRpYXRvckVycm9yJykuaW5uZXJIVE1MID0gcmVzcG9uc2UuYmxvYigpO1xuICAgIH1cblxuICAgIFxuICB9O1xufTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBtYWluKTtcblxuXG5cbiAgIl19
