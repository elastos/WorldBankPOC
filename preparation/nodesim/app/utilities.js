//import colors from 'colors';

exports.exitGraceful = (exitCode = 0) => {

  process.exitCode = exitCode;

};


exports.o = (type, ... messages) =>{
  try{
    console[type].apply(this, messages);
  }
  catch(e){
    console.error('Utilities.o has exception,', e);
  }
  

};



exports.tryParseJson = (s)=>{
  try{
    return JSON.parse(s);
  }
  catch(e){
    return undefined;
  }
};

