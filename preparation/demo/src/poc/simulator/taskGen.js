// create the editor
var container = document.getElementById("jsoneditor");
var options = {};
var editor = new JSONEditor(container, options);

document.addEventListener("DOMContentLoaded", ()=>{
    // Handler when the DOM is fully loaded
    // set json
  var json = {
    "Array": [1, 2, 3],
    "Boolean": true,
    "Null": null,
    "Number": 123,
    "Object": {"a": "b", "c": "d"},
    "String": "Hello World"
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
};

const pubTaskRoomHandler = ()=>{

};

const pubBlockRoomHandler = ()=>{

};

const pubTownHallHandler = ()=>{

};

