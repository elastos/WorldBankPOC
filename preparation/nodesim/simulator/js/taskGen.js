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
"use strict";

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// create the editor
var container = document.getElementById("jsoneditor");
var options = {};
var editor = new JSONEditor(container, options);

document.addEventListener("DOMContentLoaded", function () {
  // Handler when the DOM is fully loaded
  // set json
  var json = {
    taskType: "RaNewNode",
    potCid: "--placeholder--",
    paymentTxId: "--placeholder--"
  };
  editor.set(json);

  document.getElementById('showjson').onclick = showJsonHandler;
  document.getElementById('btn1').onclick = function () {
    editor.set({
      txType: "gasTransfer",
      fromPeerId: "user #2",
      toPeerId: "user #3",
      amt: 50
    });
  };
  document.getElementById('btn2').onclick = function () {
    editor.set({
      txType: "newNodeJoinNeedRa",
      newPeerId: "user #0",
      depositAmt: 10,
      ipfsPeerId: "placeholder"

    });
  };;
  document.getElementById('btn3').onclick = function () {
    editor.set({
      txType: "computationTask",
      cid: ""
    });
  };;
  document.getElementById('btn4').onclick = function () {
    editor.set({
      txType: "placeHolder"
    });
  };;
});

var showJsonHandler = function showJsonHandler() {
  var json = editor.get();
  console.log('json, ', json);

  document.getElementById('jsontext').innerHTML = (0, _stringify2.default)(json, null, 2);
};

},{"babel-runtime/core-js/json/stringify":1}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL2pzb24vc3RyaW5naWZ5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9qc29uL3N0cmluZ2lmeS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29yZS5qcyIsInNyYy9wb2Mvc2ltdWxhdG9yU3JjL3Rhc2tHZW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBOzs7Ozs7Ozs7O0FDRkE7QUFDQSxJQUFJLFlBQVksU0FBUyxjQUFULENBQXdCLFlBQXhCLENBQWhCO0FBQ0EsSUFBSSxVQUFVLEVBQWQ7QUFDQSxJQUFJLFNBQVMsSUFBSSxVQUFKLENBQWUsU0FBZixFQUEwQixPQUExQixDQUFiOztBQUVBLFNBQVMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLFlBQUk7QUFDOUM7QUFDQTtBQUNGLE1BQUksT0FBTztBQUNULGNBQVMsV0FEQTtBQUVULFlBQU8saUJBRkU7QUFHVCxpQkFBWTtBQUhILEdBQVg7QUFLQSxTQUFPLEdBQVAsQ0FBVyxJQUFYOztBQUdBLFdBQVMsY0FBVCxDQUF3QixVQUF4QixFQUFvQyxPQUFwQyxHQUE4QyxlQUE5QztBQUNBLFdBQVMsY0FBVCxDQUF3QixNQUF4QixFQUFnQyxPQUFoQyxHQUEwQyxZQUFJO0FBQzVDLFdBQU8sR0FBUCxDQUFXO0FBQ1QsY0FBTyxhQURFO0FBRVQsa0JBQVcsU0FGRjtBQUdULGdCQUFTLFNBSEE7QUFJVCxXQUFJO0FBSkssS0FBWDtBQU1ELEdBUEQ7QUFRQSxXQUFTLGNBQVQsQ0FBd0IsTUFBeEIsRUFBZ0MsT0FBaEMsR0FBMEMsWUFBSTtBQUM1QyxXQUFPLEdBQVAsQ0FBVztBQUNULGNBQU8sbUJBREU7QUFFVCxpQkFBVSxTQUZEO0FBR1Qsa0JBQVcsRUFIRjtBQUlULGtCQUFXOztBQUpGLEtBQVg7QUFPRCxHQVJELENBUUU7QUFDRixXQUFTLGNBQVQsQ0FBd0IsTUFBeEIsRUFBZ0MsT0FBaEMsR0FBMEMsWUFBSTtBQUM1QyxXQUFPLEdBQVAsQ0FBVztBQUNULGNBQU8saUJBREU7QUFFVCxXQUFJO0FBRkssS0FBWDtBQUlELEdBTEQsQ0FLRTtBQUNGLFdBQVMsY0FBVCxDQUF3QixNQUF4QixFQUFnQyxPQUFoQyxHQUEwQyxZQUFJO0FBQzVDLFdBQU8sR0FBUCxDQUFXO0FBQ1QsY0FBTztBQURFLEtBQVg7QUFHRCxHQUpELENBSUU7QUFDSCxDQXhDRDs7QUEwQ0EsSUFBTSxrQkFBa0IsU0FBbEIsZUFBa0IsR0FBSTtBQUMxQixNQUFNLE9BQU8sT0FBTyxHQUFQLEVBQWI7QUFDQSxVQUFRLEdBQVIsQ0FBWSxRQUFaLEVBQXNCLElBQXRCOztBQUVBLFdBQVMsY0FBVCxDQUF3QixVQUF4QixFQUFvQyxTQUFwQyxHQUFnRCx5QkFBZSxJQUFmLEVBQXFCLElBQXJCLEVBQTJCLENBQTNCLENBQWhEO0FBQ0QsQ0FMRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9qc29uL3N0cmluZ2lmeVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsInZhciBjb3JlID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpO1xudmFyICRKU09OID0gY29yZS5KU09OIHx8IChjb3JlLkpTT04gPSB7IHN0cmluZ2lmeTogSlNPTi5zdHJpbmdpZnkgfSk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHN0cmluZ2lmeShpdCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIHJldHVybiAkSlNPTi5zdHJpbmdpZnkuYXBwbHkoJEpTT04sIGFyZ3VtZW50cyk7XG59O1xuIiwidmFyIGNvcmUgPSBtb2R1bGUuZXhwb3J0cyA9IHsgdmVyc2lvbjogJzIuNi45JyB9O1xuaWYgKHR5cGVvZiBfX2UgPT0gJ251bWJlcicpIF9fZSA9IGNvcmU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcbiIsIi8vIGNyZWF0ZSB0aGUgZWRpdG9yXG52YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJqc29uZWRpdG9yXCIpO1xudmFyIG9wdGlvbnMgPSB7fTtcbnZhciBlZGl0b3IgPSBuZXcgSlNPTkVkaXRvcihjb250YWluZXIsIG9wdGlvbnMpO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKT0+e1xuICAgIC8vIEhhbmRsZXIgd2hlbiB0aGUgRE9NIGlzIGZ1bGx5IGxvYWRlZFxuICAgIC8vIHNldCBqc29uXG4gIHZhciBqc29uID0ge1xuICAgIHRhc2tUeXBlOlwiUmFOZXdOb2RlXCIsXG4gICAgcG90Q2lkOlwiLS1wbGFjZWhvbGRlci0tXCIsXG4gICAgcGF5bWVudFR4SWQ6XCItLXBsYWNlaG9sZGVyLS1cIlxuICB9O1xuICBlZGl0b3Iuc2V0KGpzb24pO1xuXG5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3dqc29uJykub25jbGljayA9IHNob3dKc29uSGFuZGxlcjtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bjEnKS5vbmNsaWNrID0gKCk9PntcbiAgICBlZGl0b3Iuc2V0KHtcbiAgICAgIHR4VHlwZTpcImdhc1RyYW5zZmVyXCIsXG4gICAgICBmcm9tUGVlcklkOlwidXNlciAjMlwiLFxuICAgICAgdG9QZWVySWQ6XCJ1c2VyICMzXCIsXG4gICAgICBhbXQ6NTBcbiAgICB9KVxuICB9O1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuMicpLm9uY2xpY2sgPSAoKT0+e1xuICAgIGVkaXRvci5zZXQoe1xuICAgICAgdHhUeXBlOlwibmV3Tm9kZUpvaW5OZWVkUmFcIixcbiAgICAgIG5ld1BlZXJJZDpcInVzZXIgIzBcIixcbiAgICAgIGRlcG9zaXRBbXQ6MTAsXG4gICAgICBpcGZzUGVlcklkOlwicGxhY2Vob2xkZXJcIlxuXG4gICAgfSlcbiAgfTs7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4zJykub25jbGljayA9ICgpPT57XG4gICAgZWRpdG9yLnNldCh7XG4gICAgICB0eFR5cGU6XCJjb21wdXRhdGlvblRhc2tcIixcbiAgICAgIGNpZDpcIlwiXG4gICAgfSlcbiAgfTs7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG40Jykub25jbGljayA9ICgpPT57XG4gICAgZWRpdG9yLnNldCh7XG4gICAgICB0eFR5cGU6XCJwbGFjZUhvbGRlclwiXG4gICAgfSlcbiAgfTs7XG59KTtcblxuY29uc3Qgc2hvd0pzb25IYW5kbGVyID0gKCk9PntcbiAgY29uc3QganNvbiA9IGVkaXRvci5nZXQoKTtcbiAgY29uc29sZS5sb2coJ2pzb24sICcsIGpzb24pO1xuXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqc29udGV4dCcpLmlubmVySFRNTCA9IEpTT04uc3RyaW5naWZ5KGpzb24sIG51bGwsIDIpO1xufTtcbiJdfQ==
