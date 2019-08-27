(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/json/stringify"), __esModule: true };
},{"core-js/library/fn/json/stringify":2}],2:[function(require,module,exports){
var core = require('../../modules/_core');
var $JSON = core.JSON || (core.JSON = { stringify: JSON.stringify });
module.exports = function stringify(it) { // eslint-disable-line no-unused-vars
  return $JSON.stringify.apply($JSON, arguments);
};

},{"../../modules/_core":3}],3:[function(require,module,exports){
var core = module.exports = { version: '2.6.9' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],4:[function(require,module,exports){
'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _utils = require('./utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.main = function (_ref) {
  var userInfo = _ref.userInfo,
      ipfs = _ref.ipfs,
      rooms = _ref.rooms;
  var userName = userInfo.userName,
      publicKey = userInfo.publicKey,
      privateKey = userInfo.privateKey,
      randRoomPostfix = userInfo.randRoomPostfix;

  document.getElementById('roomPostfix').innerText = randRoomPostfix;
  document.getElementById('userName').innerText = userName;

  (0, _utils.logToWebPage)('VRF Public Key: ' + publicKey);

  (0, _utils.logToWebPage)('IPFS PeerID: ' + rooms.townHall.getMyPeerId());
  var container = document.getElementById("jsoneditor");
  var editor = new JSONEditor(container, {});

  document.getElementById('btn1').onclick = function () {
    editor.set({
      txType: "gasTransfer",
      fromPeerId: userName,
      toPeerId: "user #0",
      amt: 15
    });
  };
  document.getElementById('btn2').onclick = function () {
    editor.set({
      txType: "newNodeJoinNeedRa",
      userName: userName,
      depositAmt: 10,
      ipfsPeerId: rooms.taskRoom.getMyPeerId()

    });
  };
  document.getElementById('btn3').onclick = function () {
    editor.set({
      txType: 'setProofOfTrustForThisNode',
      psrData: 'placeholder',
      isHacked: true,
      tpmPublicKey: 'placeholder'
    });
  };
  document.getElementById('btn4').onclick = function () {
    editor.set({
      txType: "uploadLambda",
      lambdaName: "hello_world",
      dockerImg: "placeholder",
      payment: "payPerUse",
      ownerName: userName,
      amt: 2
    });
  };
  document.getElementById('btn5').onclick = function () {
    editor.set({
      txType: "computeTask",
      userName: userName,
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
  document.getElementById('sendAction').onclick = function () {
    console.log("ready to send action,", (0, _stringify2.default)(editor.get(), null, 2));
    var jsonObj = editor.get();
    var txType = jsonObj.txType;
    try {
      var channelRoom = void 0;
      var cid = void 0;
      var broadcastObj = { txType: txType };
      var promiseCid = void 0;
      switch (txType) {
        case "gasTransfer":
          {
            channelRoom = rooms.taskRoom;
            var fromPeerId = jsonObj.fromPeerId,
                toPeerId = jsonObj.toPeerId,
                amt = jsonObj.amt;

            promiseCid = ipfs.dag.put({
              fromPeerId: fromPeerId, toPeerId: toPeerId, amt: amt
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
      promiseCid.then(function (cid) {
        broadcastObj.cid = cid.toBaseEncodedString();
        if (txType == 'uploadLambda') {
          (0, _utils.logToWebPage)('Please record this CID number, you will need it when you submit a compute task using this Lamdba: ' + broadcastObj.cid);
        }
        channelRoom.broadcast((0, _stringify2.default)(broadcastObj));
        console.log("Sent action: ", (0, _stringify2.default)(broadcastObj));
      }).catch(function (e) {
        throw e;
      });
    } catch (e) {
      console.log("inside sendActionToRoom, excpetion:", e);
    }
  };
};

},{"./utils.js":5,"babel-runtime/core-js/json/stringify":1}],5:[function(require,module,exports){
'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.getUrlVars = function () {
  var vars = {};
  var decodedUri = decodeURI(window.location.href);
  var parts = decodedUri.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value;
  });
  return vars;
};

exports.tryParseJson = function (s) {
  try {
    return JSON.parse(s);
  } catch (e) {
    return undefined;
  }
};

exports.logToWebPage = function (log, json) {
  var logEle = document.getElementById('log');
  var jsonBetterLooking = json ? '<pre><code>' + (0, _stringify2.default)(json, undefined, 2) + '</code></pre>' : '';
  var innerHtml = '<li>' + log + jsonBetterLooking + '</li>';
  logEle.innerHTML = innerHtml + logEle.innerHTML;
};

exports.updateLog = function (type, opts) {
  console.log(111, type, opts);
  $.ajax({
    url: '/poc/pot_log_update?type=' + type,
    type: 'post',
    data: opts || {}
  }).then(function (rs) {});
};

},{"babel-runtime/core-js/json/stringify":1}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL2pzb24vc3RyaW5naWZ5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9qc29uL3N0cmluZ2lmeS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29yZS5qcyIsInNyYy9wb2Mvc2ltdWxhdG9yU3JjL3NpbXVsYXRvci5qcyIsInNyYy9wb2Mvc2ltdWxhdG9yU3JjL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUNGQTs7OztBQUVBLFFBQVEsSUFBUixHQUFlLGdCQUEyQjtBQUFBLE1BQXpCLFFBQXlCLFFBQXpCLFFBQXlCO0FBQUEsTUFBZixJQUFlLFFBQWYsSUFBZTtBQUFBLE1BQVQsS0FBUyxRQUFULEtBQVM7QUFBQSxNQUNqQyxRQURpQyxHQUNtQixRQURuQixDQUNqQyxRQURpQztBQUFBLE1BQ3ZCLFNBRHVCLEdBQ21CLFFBRG5CLENBQ3ZCLFNBRHVCO0FBQUEsTUFDWixVQURZLEdBQ21CLFFBRG5CLENBQ1osVUFEWTtBQUFBLE1BQ0EsZUFEQSxHQUNtQixRQURuQixDQUNBLGVBREE7O0FBRXhDLFdBQVMsY0FBVCxDQUF3QixhQUF4QixFQUF1QyxTQUF2QyxHQUFtRCxlQUFuRDtBQUNBLFdBQVMsY0FBVCxDQUF3QixVQUF4QixFQUFvQyxTQUFwQyxHQUFnRCxRQUFoRDs7QUFHQSxnREFBZ0MsU0FBaEM7O0FBRUEsNkNBQTZCLE1BQU0sUUFBTixDQUFlLFdBQWYsRUFBN0I7QUFDQSxNQUFJLFlBQVksU0FBUyxjQUFULENBQXdCLFlBQXhCLENBQWhCO0FBQ0EsTUFBSSxTQUFTLElBQUksVUFBSixDQUFlLFNBQWYsRUFBMEIsRUFBMUIsQ0FBYjs7QUFFQSxXQUFTLGNBQVQsQ0FBd0IsTUFBeEIsRUFBZ0MsT0FBaEMsR0FBMEMsWUFBSTtBQUM1QyxXQUFPLEdBQVAsQ0FBVztBQUNULGNBQU8sYUFERTtBQUVULGtCQUFZLFFBRkg7QUFHVCxnQkFBUyxTQUhBO0FBSVQsV0FBSTtBQUpLLEtBQVg7QUFNRCxHQVBEO0FBUUEsV0FBUyxjQUFULENBQXdCLE1BQXhCLEVBQWdDLE9BQWhDLEdBQTBDLFlBQUk7QUFDNUMsV0FBTyxHQUFQLENBQVc7QUFDVCxjQUFPLG1CQURFO0FBRVQsd0JBRlM7QUFHVCxrQkFBVyxFQUhGO0FBSVQsa0JBQVcsTUFBTSxRQUFOLENBQWUsV0FBZjs7QUFKRixLQUFYO0FBT0QsR0FSRDtBQVNBLFdBQVMsY0FBVCxDQUF3QixNQUF4QixFQUFnQyxPQUFoQyxHQUEwQyxZQUFJO0FBQzVDLFdBQU8sR0FBUCxDQUFXO0FBQ1QsY0FBTyw0QkFERTtBQUVULGVBQVEsYUFGQztBQUdULGdCQUFTLElBSEE7QUFJVCxvQkFBYTtBQUpKLEtBQVg7QUFNRCxHQVBEO0FBUUEsV0FBUyxjQUFULENBQXdCLE1BQXhCLEVBQWdDLE9BQWhDLEdBQTBDLFlBQUk7QUFDNUMsV0FBTyxHQUFQLENBQVc7QUFDVCxjQUFPLGNBREU7QUFFVCxrQkFBVyxhQUZGO0FBR1QsaUJBQVUsYUFIRDtBQUlULGVBQVEsV0FKQztBQUtULGlCQUFVLFFBTEQ7QUFNVCxXQUFJO0FBTkssS0FBWDtBQVFELEdBVEQ7QUFVQSxXQUFTLGNBQVQsQ0FBd0IsTUFBeEIsRUFBZ0MsT0FBaEMsR0FBMEMsWUFBSTtBQUM1QyxXQUFPLEdBQVAsQ0FBVztBQUNULGNBQU8sYUFERTtBQUVULHdCQUZTO0FBR1QsaUJBQVUsb0ZBSEQ7QUFJVCxtQkFBWSxhQUpIO0FBS1QsV0FBSTtBQUNGLGlCQUFRLGVBRE47QUFFRixtQkFBVSxNQUZSO0FBR0YsNkJBQW9CLE9BSGxCO0FBSUYsMEJBQWlCLE9BSmY7QUFLRix5QkFBZ0IsT0FMZDtBQU1GLHVCQUFjLE1BTlo7QUFPRixpQkFBUSxLQVBOO0FBUUYsc0JBQWE7QUFSWCxPQUxLO0FBZVQsMkJBQW9CO0FBQ2xCLGdCQUFPLENBRFc7QUFFbEIsaUJBQVE7O0FBRlUsT0FmWDtBQW9CVCxvQkFBYSxNQXBCSjtBQXFCVCxrQkFBVztBQXJCRixLQUFYO0FBd0JELEdBekJEO0FBMEJBLFdBQVMsY0FBVCxDQUF3QixZQUF4QixFQUFzQyxPQUF0QyxHQUFnRCxZQUFJO0FBQ2xELFlBQVEsR0FBUixDQUFZLHVCQUFaLEVBQW9DLHlCQUFlLE9BQU8sR0FBUCxFQUFmLEVBQTZCLElBQTdCLEVBQW1DLENBQW5DLENBQXBDO0FBQ0EsUUFBTSxVQUFVLE9BQU8sR0FBUCxFQUFoQjtBQUNBLFFBQU0sU0FBUyxRQUFRLE1BQXZCO0FBQ0EsUUFBRztBQUNELFVBQUksb0JBQUo7QUFDQSxVQUFJLFlBQUo7QUFDQSxVQUFNLGVBQWUsRUFBQyxjQUFELEVBQXJCO0FBQ0EsVUFBSSxtQkFBSjtBQUNBLGNBQU8sTUFBUDtBQUNFLGFBQUssYUFBTDtBQUFtQjtBQUNqQiwwQkFBYyxNQUFNLFFBQXBCO0FBRGlCLGdCQUVWLFVBRlUsR0FFbUIsT0FGbkIsQ0FFVixVQUZVO0FBQUEsZ0JBRUUsUUFGRixHQUVtQixPQUZuQixDQUVFLFFBRkY7QUFBQSxnQkFFWSxHQUZaLEdBRW1CLE9BRm5CLENBRVksR0FGWjs7QUFHakIseUJBQWEsS0FBSyxHQUFMLENBQVMsR0FBVCxDQUFhO0FBQ3hCLG9DQUR3QixFQUNaLGtCQURZLEVBQ0Y7QUFERSxhQUFiLENBQWI7O0FBSUE7QUFDRDtBQUNELGFBQUssNEJBQUw7QUFDRSxpQkFBTyxnQkFBUCxHQUEwQixPQUExQjtBQUNBO0FBQ0YsYUFBSyxtQkFBTDtBQUNBLGFBQUssY0FBTDtBQUNBLGFBQUssYUFBTDtBQUNFLHdCQUFjLE1BQU0sUUFBcEI7QUFDQSx1QkFBYSxLQUFLLEdBQUwsQ0FBUyxHQUFULENBQWEsT0FBYixDQUFiO0FBQ0E7QUFDRjtBQUNFLGlCQUFPLFFBQVEsR0FBUixDQUFZLGdDQUFaLEVBQThDLE1BQTlDLENBQVA7QUFwQko7QUFzQkEsaUJBQVcsSUFBWCxDQUFnQixVQUFDLEdBQUQsRUFBTztBQUNyQixxQkFBYSxHQUFiLEdBQW1CLElBQUksbUJBQUosRUFBbkI7QUFDQSxZQUFHLFVBQVUsY0FBYixFQUE0QjtBQUMxQiwwSUFBa0gsYUFBYSxHQUEvSDtBQUNEO0FBQ0Qsb0JBQVksU0FBWixDQUFzQix5QkFBZSxZQUFmLENBQXRCO0FBQ0EsZ0JBQVEsR0FBUixDQUFZLGVBQVosRUFBNEIseUJBQWUsWUFBZixDQUE1QjtBQUNELE9BUEQsRUFRQyxLQVJELENBUU8sVUFBQyxDQUFELEVBQUs7QUFDVixjQUFNLENBQU47QUFDRCxPQVZEO0FBWUQsS0F2Q0QsQ0F3Q0EsT0FBTSxDQUFOLEVBQVE7QUFDTixjQUFRLEdBQVIsQ0FBWSxxQ0FBWixFQUFtRCxDQUFuRDtBQUNEO0FBQ0YsR0EvQ0Q7QUFnREQsQ0F6SEQ7Ozs7Ozs7Ozs7O0FDRkEsUUFBUSxVQUFSLEdBQXFCLFlBQUk7QUFDdkIsTUFBTSxPQUFPLEVBQWI7QUFDQSxNQUFNLGFBQWEsVUFBVSxPQUFPLFFBQVAsQ0FBZ0IsSUFBMUIsQ0FBbkI7QUFDQSxNQUFNLFFBQVEsV0FBVyxPQUFYLENBQW1CLHlCQUFuQixFQUE4QyxVQUFDLENBQUQsRUFBRyxHQUFILEVBQU8sS0FBUCxFQUFnQjtBQUN4RSxTQUFLLEdBQUwsSUFBWSxLQUFaO0FBQ0gsR0FGYSxDQUFkO0FBR0EsU0FBTyxJQUFQO0FBQ0QsQ0FQRDs7QUFTQSxRQUFRLFlBQVIsR0FBdUIsVUFBQyxDQUFELEVBQUs7QUFDMUIsTUFBRztBQUNELFdBQU8sS0FBSyxLQUFMLENBQVcsQ0FBWCxDQUFQO0FBQ0QsR0FGRCxDQUdBLE9BQU0sQ0FBTixFQUFRO0FBQ04sV0FBTyxTQUFQO0FBQ0Q7QUFDRixDQVBEOztBQVNBLFFBQVEsWUFBUixHQUF1QixVQUFDLEdBQUQsRUFBTSxJQUFOLEVBQWE7QUFDbEMsTUFBTSxTQUFTLFNBQVMsY0FBVCxDQUF3QixLQUF4QixDQUFmO0FBQ0EsTUFBTSxvQkFBb0IsT0FBTSxnQkFBZ0IseUJBQWUsSUFBZixFQUFxQixTQUFyQixFQUFnQyxDQUFoQyxDQUFoQixHQUFxRCxlQUEzRCxHQUE2RSxFQUF2RztBQUNBLE1BQU0sWUFBWSxTQUFTLEdBQVQsR0FBZSxpQkFBZixHQUFtQyxPQUFyRDtBQUNBLFNBQU8sU0FBUCxHQUFtQixZQUFZLE9BQU8sU0FBdEM7QUFDRCxDQUxEOztBQU9BLFFBQVEsU0FBUixHQUFvQixVQUFDLElBQUQsRUFBTyxJQUFQLEVBQWM7QUFDaEMsVUFBUSxHQUFSLENBQVksR0FBWixFQUFpQixJQUFqQixFQUF1QixJQUF2QjtBQUNBLElBQUUsSUFBRixDQUFPO0FBQ0wsU0FBTSw4QkFBNEIsSUFEN0I7QUFFTCxVQUFPLE1BRkY7QUFHTCxVQUFPLFFBQVE7QUFIVixHQUFQLEVBSUcsSUFKSCxDQUlRLFVBQUMsRUFBRCxFQUFNLENBQUUsQ0FKaEI7QUFLRCxDQVBEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL2pzb24vc3RyaW5naWZ5XCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwidmFyIGNvcmUgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJyk7XG52YXIgJEpTT04gPSBjb3JlLkpTT04gfHwgKGNvcmUuSlNPTiA9IHsgc3RyaW5naWZ5OiBKU09OLnN0cmluZ2lmeSB9KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3RyaW5naWZ5KGl0KSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgcmV0dXJuICRKU09OLnN0cmluZ2lmeS5hcHBseSgkSlNPTiwgYXJndW1lbnRzKTtcbn07XG4iLCJ2YXIgY29yZSA9IG1vZHVsZS5leHBvcnRzID0geyB2ZXJzaW9uOiAnMi42LjknIH07XG5pZiAodHlwZW9mIF9fZSA9PSAnbnVtYmVyJykgX19lID0gY29yZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuIiwiaW1wb3J0IHtnZXRVcmxWYXJzLCBsb2dUb1dlYlBhZ2V9IGZyb20gJy4vdXRpbHMuanMnO1xuXG5leHBvcnRzLm1haW4gPSAoe3VzZXJJbmZvLCBpcGZzLCByb29tc30pPT57XG4gIGNvbnN0IHt1c2VyTmFtZSwgcHVibGljS2V5LCBwcml2YXRlS2V5LCByYW5kUm9vbVBvc3RmaXh9ID0gdXNlckluZm87XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb29tUG9zdGZpeCcpLmlubmVyVGV4dCA9IHJhbmRSb29tUG9zdGZpeDtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJOYW1lJykuaW5uZXJUZXh0ID0gdXNlck5hbWU7XG4gIFxuICBcbiAgbG9nVG9XZWJQYWdlKGBWUkYgUHVibGljIEtleTogJHtwdWJsaWNLZXl9YCk7XG4gIFxuICBsb2dUb1dlYlBhZ2UoYElQRlMgUGVlcklEOiAke3Jvb21zLnRvd25IYWxsLmdldE15UGVlcklkKCl9YCk7XG4gIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImpzb25lZGl0b3JcIik7XG4gIHZhciBlZGl0b3IgPSBuZXcgSlNPTkVkaXRvcihjb250YWluZXIsIHt9KTtcblxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuMScpLm9uY2xpY2sgPSAoKT0+e1xuICAgIGVkaXRvci5zZXQoe1xuICAgICAgdHhUeXBlOlwiZ2FzVHJhbnNmZXJcIixcbiAgICAgIGZyb21QZWVySWQ6IHVzZXJOYW1lLFxuICAgICAgdG9QZWVySWQ6XCJ1c2VyICMwXCIsXG4gICAgICBhbXQ6MTVcbiAgICB9KVxuICB9XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4yJykub25jbGljayA9ICgpPT57XG4gICAgZWRpdG9yLnNldCh7XG4gICAgICB0eFR5cGU6XCJuZXdOb2RlSm9pbk5lZWRSYVwiLFxuICAgICAgdXNlck5hbWUsXG4gICAgICBkZXBvc2l0QW10OjEwLFxuICAgICAgaXBmc1BlZXJJZDpyb29tcy50YXNrUm9vbS5nZXRNeVBlZXJJZCgpLFxuXG4gICAgfSlcbiAgfTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bjMnKS5vbmNsaWNrID0gKCk9PntcbiAgICBlZGl0b3Iuc2V0KHtcbiAgICAgIHR4VHlwZTonc2V0UHJvb2ZPZlRydXN0Rm9yVGhpc05vZGUnLFxuICAgICAgcHNyRGF0YToncGxhY2Vob2xkZXInLFxuICAgICAgaXNIYWNrZWQ6dHJ1ZSxcbiAgICAgIHRwbVB1YmxpY0tleToncGxhY2Vob2xkZXInXG4gICAgfSlcbiAgfTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bjQnKS5vbmNsaWNrID0gKCk9PntcbiAgICBlZGl0b3Iuc2V0KHtcbiAgICAgIHR4VHlwZTpcInVwbG9hZExhbWJkYVwiLFxuICAgICAgbGFtYmRhTmFtZTpcImhlbGxvX3dvcmxkXCIsXG4gICAgICBkb2NrZXJJbWc6XCJwbGFjZWhvbGRlclwiLFxuICAgICAgcGF5bWVudDpcInBheVBlclVzZVwiLFxuICAgICAgb3duZXJOYW1lOnVzZXJOYW1lLFxuICAgICAgYW10OjJcbiAgICB9KTtcbiAgfTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bjUnKS5vbmNsaWNrID0gKCk9PntcbiAgICBlZGl0b3Iuc2V0KHtcbiAgICAgIHR4VHlwZTpcImNvbXB1dGVUYXNrXCIsXG4gICAgICB1c2VyTmFtZSxcbiAgICAgIGxhbWJkYUNpZDpcIlBMRUFTRV9SRVBMQUNFX1RISVNfVkFMVUVfVE9fVEhFX2xhbWJkYUNpZF9ZT1VfR09UX0ZST01fUFJFVklPVVNfdXBsb2FkTGFtYmRhX1RBU0tcIixcbiAgICAgIHBvc3RTZWNEYXRhOidwbGFjZWhvbGRlcicsXG4gICAgICBlbnY6e1xuICAgICAgICBuZXR3b3JrOid0b3RhbElzb2xhdGVkJyxcbiAgICAgICAgaXBBbGxvd2VkOidub25lJyxcbiAgICAgICAgcDJwVHJhZmZpY0luQWxsb3dlZDonb3duZXInLFxuICAgICAgICByZXN1bHRTZW5kQmFja1RvOidvd25lcicsXG4gICAgICAgIGVycm9yU2VuZEJhY2tUbzonb3duZXInLFxuICAgICAgICBvc1JlcXVpcmVtZW50Olwibm9uZVwiLFxuICAgICAgICB0aW1lT3V0OicxMDAnLFxuICAgICAgICBjbGVhblVwQWZ0ZXI6J3RvdGFsV2lwZW91dCdcbiAgICAgIH0sXG4gICAgICBleGVjdXRvclJlcXVpcmVtZW50OntcbiAgICAgICAgY3JlZGl0OjMsXG4gICAgICAgIGRlcG9zaXQ6MTBcblxuICAgICAgfSxcbiAgICAgIG11bHRpUGFydGllczonbm9uZScsXG4gICAgICBkZXBvc2l0QW10OjNcbiAgICB9KTtcblxuICB9O1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VuZEFjdGlvbicpLm9uY2xpY2sgPSAoKT0+e1xuICAgIGNvbnNvbGUubG9nKFwicmVhZHkgdG8gc2VuZCBhY3Rpb24sXCIsSlNPTi5zdHJpbmdpZnkoZWRpdG9yLmdldCgpLCBudWxsLCAyKSk7XG4gICAgY29uc3QganNvbk9iaiA9IGVkaXRvci5nZXQoKTtcbiAgICBjb25zdCB0eFR5cGUgPSBqc29uT2JqLnR4VHlwZTtcbiAgICB0cnl7XG4gICAgICBsZXQgY2hhbm5lbFJvb207XG4gICAgICBsZXQgY2lkO1xuICAgICAgY29uc3QgYnJvYWRjYXN0T2JqID0ge3R4VHlwZX07XG4gICAgICBsZXQgcHJvbWlzZUNpZDtcbiAgICAgIHN3aXRjaCh0eFR5cGUpe1xuICAgICAgICBjYXNlIFwiZ2FzVHJhbnNmZXJcIjp7XG4gICAgICAgICAgY2hhbm5lbFJvb20gPSByb29tcy50YXNrUm9vbTtcbiAgICAgICAgICBjb25zdCB7ZnJvbVBlZXJJZCwgdG9QZWVySWQsIGFtdH0gPSBqc29uT2JqO1xuICAgICAgICAgIHByb21pc2VDaWQgPSBpcGZzLmRhZy5wdXQoe1xuICAgICAgICAgICAgZnJvbVBlZXJJZCwgdG9QZWVySWQsIGFtdFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIFxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJzZXRQcm9vZk9mVHJ1c3RGb3JUaGlzTm9kZVwiOlxuICAgICAgICAgIHdpbmRvdy5wcm9vZk9mVHJ1c3RUZXN0ID0ganNvbk9iajtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNhc2UgXCJuZXdOb2RlSm9pbk5lZWRSYVwiOlxuICAgICAgICBjYXNlICd1cGxvYWRMYW1iZGEnOlxuICAgICAgICBjYXNlIFwiY29tcHV0ZVRhc2tcIjpcbiAgICAgICAgICBjaGFubmVsUm9vbSA9IHJvb21zLnRhc2tSb29tO1xuICAgICAgICAgIHByb21pc2VDaWQgPSBpcGZzLmRhZy5wdXQoanNvbk9iaik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwidW5zdXBwb3J0ZWQgc2VuZEFjdGlvbiB0eFR5cGUsXCIsIHR4VHlwZSk7XG4gICAgICB9XG4gICAgICBwcm9taXNlQ2lkLnRoZW4oKGNpZCk9PntcbiAgICAgICAgYnJvYWRjYXN0T2JqLmNpZCA9IGNpZC50b0Jhc2VFbmNvZGVkU3RyaW5nKCk7XG4gICAgICAgIGlmKHR4VHlwZSA9PSAndXBsb2FkTGFtYmRhJyl7XG4gICAgICAgICAgbG9nVG9XZWJQYWdlKGBQbGVhc2UgcmVjb3JkIHRoaXMgQ0lEIG51bWJlciwgeW91IHdpbGwgbmVlZCBpdCB3aGVuIHlvdSBzdWJtaXQgYSBjb21wdXRlIHRhc2sgdXNpbmcgdGhpcyBMYW1kYmE6ICR7YnJvYWRjYXN0T2JqLmNpZH1gKVxuICAgICAgICB9XG4gICAgICAgIGNoYW5uZWxSb29tLmJyb2FkY2FzdChKU09OLnN0cmluZ2lmeShicm9hZGNhc3RPYmopKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJTZW50IGFjdGlvbjogXCIsSlNPTi5zdHJpbmdpZnkoYnJvYWRjYXN0T2JqKSk7XG4gICAgICB9KSBcbiAgICAgIC5jYXRjaCgoZSk9PntcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH0pXG5cbiAgICB9XG4gICAgY2F0Y2goZSl7XG4gICAgICBjb25zb2xlLmxvZyhcImluc2lkZSBzZW5kQWN0aW9uVG9Sb29tLCBleGNwZXRpb246XCIsIGUpO1xuICAgIH1cbiAgfTtcbn07XG5cblxuXG5cbiAgIiwiZXhwb3J0cy5nZXRVcmxWYXJzID0gKCk9PntcbiAgY29uc3QgdmFycyA9IHt9O1xuICBjb25zdCBkZWNvZGVkVXJpID0gZGVjb2RlVVJJKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcbiAgY29uc3QgcGFydHMgPSBkZWNvZGVkVXJpLnJlcGxhY2UoL1s/Jl0rKFtePSZdKyk9KFteJl0qKS9naSwgKG0sa2V5LHZhbHVlKSA9PntcbiAgICAgIHZhcnNba2V5XSA9IHZhbHVlO1xuICB9KTtcbiAgcmV0dXJuIHZhcnM7XG59XG5cbmV4cG9ydHMudHJ5UGFyc2VKc29uID0gKHMpPT57XG4gIHRyeXtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShzKTtcbiAgfVxuICBjYXRjaChlKXtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbmV4cG9ydHMubG9nVG9XZWJQYWdlID0gKGxvZywganNvbik9PntcbiAgY29uc3QgbG9nRWxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZycpO1xuICBjb25zdCBqc29uQmV0dGVyTG9va2luZyA9IGpzb24/ICc8cHJlPjxjb2RlPicgKyBKU09OLnN0cmluZ2lmeShqc29uLCB1bmRlZmluZWQsIDIpICsgJzwvY29kZT48L3ByZT4nIDogJyc7XG4gIGNvbnN0IGlubmVySHRtbCA9ICc8bGk+JyArIGxvZyArIGpzb25CZXR0ZXJMb29raW5nICsgJzwvbGk+JztcbiAgbG9nRWxlLmlubmVySFRNTCA9IGlubmVySHRtbCArIGxvZ0VsZS5pbm5lckhUTUw7XG59XG5cbmV4cG9ydHMudXBkYXRlTG9nID0gKHR5cGUsIG9wdHMpPT57XG4gIGNvbnNvbGUubG9nKDExMSwgdHlwZSwgb3B0cyk7XG4gICQuYWpheCh7XG4gICAgdXJsIDogJy9wb2MvcG90X2xvZ191cGRhdGU/dHlwZT0nK3R5cGUsXG4gICAgdHlwZSA6ICdwb3N0JyxcbiAgICBkYXRhIDogb3B0cyB8fCB7fVxuICB9KS50aGVuKChycyk9Pnt9KVxufSJdfQ==
