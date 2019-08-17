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

exports.logToWebPage = (log)=>{
  try{
    console.log(log);
    const logEle = document.getElementById('log');
    logEle.innerHTML = '<ul>' + log + '</ul>' + logEle.innerHTML;
  }catch(e){}
}