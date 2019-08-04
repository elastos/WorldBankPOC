const vrfSim = require('./vrfSim');
const potSim = require( './potSim');
const ethSim = require( './ethSim');
const constValue = require( './constValue');
const addNewRaLogSchema = require('./raLogSchema');
const creditScoreSim = require('./creditScore');
const APIError = require('../api/utils/APIError');


const weightedThreshold = (creditScore) => {
  const weight = creditScore / constValue.totalCreditToken;
  return weight * constValue.thresholdForVrfRa;
};

const signature = (peerId, privKey, input) =>{

}


exports.verifyOthersRa = () => {

};

const luckyDraw = async ({peerId, potHash, creditScore, privKey}) => {

  const {pi, outputHash} = vrfSim.createVrf({peerId, privKey, inputHash: potHash});
  const threshold = weightedThreshold(creditScore);
  const vrfHash = outputHash;
  if(vrfHash < threshold){
    return {result: true, vrfHash, pi, threshold};
    
  }else{
    return {result: false, vrfHash, pi, threshold};
  }
};

exports.tryRa = async ({peerId, potHash}) => {
  const credit = await creditScoreSim.get(peerId);
  if (! credit) {
    throw new APIError({
      message: 'peer not exists',
      status: httpStatus.NOT_FOUND,
    });
  }
  const {creditScore, privKey} = credit;

  const luckyDrawResult = await luckyDraw({peerId, potHash, creditScore, privKey});
  if(! luckyDrawResult.result){
    return {result:false, message:"Not lucky enough", luckyDrawResult};
  }
  
  console.log("I am lucky, I have the chance to run RA, ", luckyDrawResult.vrfHash, luckyDrawResult.threshold);
  console.log('placeholder, doing RemoteAttestation ....');
  const pot = await potSim.getPotFromHash(potHash);
  if (! pot){
    throw new APIError({message: 'potHash not exists', status: httpStatus.NOT_FOUND});
  }
  
  const raResult = potSim.verifyPot(pot, false);
  const {pi, vrfHash, threshold} = luckyDrawResult;
  const blockHeight = 0; //placeholder
  console.log("peerId, potHash, pi, vrfHash, blockHeight, raResult, threshold", {
    peerId, potHash, pi, vrfHash, blockHeight, raResult, threshold
  });
  const saveNewRaLog = await addNewRaLogSchema.addNewRaLog({
    peerId, potHash, pi, vrfHash, blockHeight, raResult, threshold
  });

  return {result:true, raResult};
  //ethSim.signRaTask('sigPlaceHolder', newJoinTxHash, pi, raResult);


};

exports.notifyNewJoinNodeNeedRa = ({newJoinTxHash, peerId, privKey, creditScore}) => {
  const inputHash = newJoinTxHash;
  
};