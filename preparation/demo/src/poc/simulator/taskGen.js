// create the editor
var container = document.getElementById("jsoneditor");
var options = {};
var editor = new JSONEditor(container, options);

document.addEventListener("DOMContentLoaded", ()=>{
    // Handler when the DOM is fully loaded
    // set json
  var json = {
    taskType:"RaNewNode",
    potCid:"--placeholder--",
    paymentTxId:"--placeholder--"
  };
  editor.set(json);


  document.getElementById('showjson').onclick = showJsonHandler;
  document.getElementById('pubtaskroom').onclick = pubTaskRoomHandler;
  document.getElementById('pubtownhall').onclick = pubBlockRoomHandler;
  document.getElementById('pubblockroom').onclick = pubTownHallHandler;
  
});

const showJsonHandler = ()=>{
  const json = editor.get();
  console.log('json, ', json);

  document.getElementById('jsontext').innerHTML = JSON.stringify(json, null, 2);
};
