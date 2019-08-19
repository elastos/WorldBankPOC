exports.getUrlVars = ()=>{
  const vars = {};
  const decodedUri = decodeURI(window.location.href);
  const parts = decodedUri.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m,key,value) =>{
      vars[key] = value;
  });
  return vars;
}

exports.tryParseJson = (s)=>{
  try{
    return JSON.parse(s);
  }
  catch(e){
    return undefined;
  }
}

exports.logToWebPage = (log, json)=>{
  const logEle = document.getElementById('log');
  const jsonBetterLooking = json? '<pre><code>' + JSON.stringify(json, undefined, 2) + '</code></pre>' : '';
  const innerHtml = '<li>' + log + jsonBetterLooking + '</li>';
  logEle.innerHTML = innerHtml + logEle.innerHTML;
}

exports.updateLog = (type, opts)=>{
  console.log(111, type, opts);
  $.ajax({
    url : '/poc/pot_log_update?type='+type,
    type : 'post',
    data : opts || {}
  }).then((rs)=>{})
}