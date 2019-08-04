const vrfSim = require('./vrfSim');
const potSim = require( './potSim');
const ethSim = require( './ethSim');
const constValue = require( './constValue');
const raLogSchema = require('./raLogSchema');
const creditScoreSim = require('./creditSchema');
const APIError = require('../api/utils/APIError');
const STATIC_THRESHOLD_FOR_REMOTE_ATTESTATION = 0;

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

const runRaConsensus = async ({potHash}) => {
  const activePots = await raLogSchema.getAllActiveRaLogFromPotHash({potHash});
  //console.log('activePots', activePots);
  const verifyVrf = (pot) => {
    //placeholder
    return true;
  }
  const verifyPeerCreditAtOriginalHeight = (pot) =>{
    return true;//placeholder
  }
  const reducer = (accumulator, current) => {
    if( ! verifyVrf(current)) return accumulator;
    if( ! verifyPeerCreditAtOriginalHeight) return accumulator;
    const positiveOrNegative = current.raResult? 1 : -1;
    accumulator.weightedScore += positiveOrNegative * current.creditScoreAtBlockHeightTime;
    accumulator.raPeerCount += 1;
    return accumulator;
  }

  const accum = activePots.reduce(reducer, {weightedScore:0, raPeerCount:0});
  console.log('accum,', accum);
  if( accum.raPeerCount < 5){
    return {result: false, message:'less than 5 remote attestators, please wait for more attestators to verify', activePots}
  }else{
    const potIds = activePots.map(p=>p._id);
    raLogSchema.finalizeRaLogs(potIds);
    if(accum.weightedScore < STATIC_THRESHOLD_FOR_REMOTE_ATTESTATION){
      return {result: false, message:'we have enough remote attestators, but the result is false', accum, activePots};
    }else{
      return {result: true, message:'we have enough remote attestators support you. Welcome to our trusted network', accum, activePots};
    }
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
  const saveNewRaLog = await raLogSchema.addNewRaLog({
    peerId, potHash, pi, vrfHash, blockHeight, creditScoreAtBlockHeightTime: creditScore, raResult, threshold
  });

  const currentRaConsensusResult = await runRaConsensus({potHash});


  return {result:true, raResult, currentRaConsensusResult};
  //ethSim.signRaTask('sigPlaceHolder', newJoinTxHash, pi, raResult);


};

exports.notifyNewJoinNodeNeedRa = ({newJoinTxHash, peerId, privKey, creditScore}) => {
  const inputHash = newJoinTxHash;
  
};