exports.creditScore = require('./creditSchema');
exports.potSim = require('./potSim');
exports.remoteAttestationSim = require('./remoteAttestationSim');
exports.potSchema = require('./potSchema');
exports.betterResponse = require('./betterResponse');
exports.raLogSchema = require('./raLogSchema');
exports.txLogSchema = require('./txLogSchema');
exports.gasSim = require('./gasSim');

exports.result = (res, code, dataOrError, message='')=>{
  const json = {
    code, message
  };
  if(code > 0){
    json.data = dataOrError;
  }
  else{
    json.error = dataOrError;
  }
  res.set('Content-Type', 'application/json');
  return res.json(json);
};

