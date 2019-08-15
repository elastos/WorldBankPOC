exports.getUrlVars = ()=>{
  const vars = {};
  const decodedUri = decodeURI(window.location.href);
  const parts = decodedUri.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m,key,value) =>{
      vars[key] = value;
  });
  return vars;
}