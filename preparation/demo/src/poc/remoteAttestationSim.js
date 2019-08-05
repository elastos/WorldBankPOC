const vrfSim = require('./vrfSim');
const potSim = require( './potSim');
const ethSim = require( './gasSim');
const constValue = require( './constValue');
const raLogSchema = require('./raLogSchema');
const creditScoreSim = require('./creditSchema');
const gasSim = require('./gasSim');
const APIError = require('../api/utils/APIError');
const txLogSchema = require('./txLogSchema');
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
      const rewardedGasAndCredit =  await runSmartContractToDistributeGasAndCredit(activePots, false);
      return {result: false, message:'we have enough remote attestators, but the result is false', accum, activePots};
    }else{
      const rewardedGasAndCredit =  await runSmartContractToDistributeGasAndCredit(activePots, true);
      return {result: true, message:'we have enough remote attestators support you. Welcome to our trusted network', rewardedGasAndCredit, accum, activePots};
    }
  }
   
};

const runSmartContractToDistributeGasAndCredit = (activePots, raResult)=>{
  //those ra nodes who vote result is the same is final result get reward, thsoe ra nodes who vote against the final result get penalty
  return {message:'not implemented, to be continue. runSmartContractToDistributeGasAndCredit'};
};

exports.depositGasTxIdValidation = ({fromPeerId, toPeerId, amt, tokenType, referenceEventType, referenceEventId})=>{
  if(fromPeerId != constValue.gasFaucetPeerId){
    if(fromPeeId != peerId) return false;
  }
  if(amt < 10)  return false;
  
  if(tokenType != 'gas') return false;
  if(referenceEventType != 'NewNodeJoinDepositGas_ref_peerId') return false;
  if((referenceEventId != constValue.gasFaucetPeerId) && (referenceEventId != peerId)) return false;
  return true;
};

const payEqualDepositToStartRa =  async (myPeerId, depositGasTxId)=>{
  const originalDepositTxObj = txLogSchema.txByTxId(depositGasTxId);
  const {amt, referenceEventType, referenceEventId} = originalDepositTxObj;
  return gasSim.transferGasToEscrow(myPeerId, amt, referenceEventType, referenceEventId);
};

exports.tryRa = async ({peerId, potHash}) => {
  const credit = await creditScoreSim.get(peerId);
  if (! credit) {
    return ({
      reuslt:'error',
      message: 'peer not exists',
      
    });
  }
  const pot = await potSim.getPotFromHash(potHash);
  if (! pot){
    return {result:'error', message: 'potHash not exists'};
  }
  const {depositGasTxId} = pot;
  if(! await txLogSchema.doValidationOnGasTx(depositGasTxId, this.depositGasTxIdValidation)){
    //return betterResponse.responseBetterJson(res, {peerId, hacked, depositGasTxId}, {error:'We cannot find the Proof of Payment from the TxId You attached. In order to join the trusted network, you have to pay a init gas fee for other trusted nodes to give you an approval based on PoT value. This is called Remote Attestation. Please attach the txId of your deposit to Escrow account'});
    return {
      result: 'error',
      message: 'The payment validation failed. Make sure you paid the deposit when submit new join peer. Remote Attestation node need to make sure you have enough deposit before continue validation',
      
    };
  }
  
  const {creditScore, privKey} = credit;

  const luckyDrawResult = await luckyDraw({peerId, potHash, creditScore, privKey});
  if(! luckyDrawResult.result){
    return {result:false, message:"Not lucky enough", luckyDrawResult};
  }
  console.log("I am lucky, I have the chance to run RA, ", luckyDrawResult.vrfHash, luckyDrawResult.threshold);
  console.log("But I have to pay the gas deposit before start RA. The deposit will be the same amount as the new Join Node's deposit. If I failed, I will lose my deposit, but if I win, I will win it back plus shared New Node'deposit and credit too.")
  const myPayDepositResultTxId = await payEqualDepositToStartRa(peerId, depositGasTxId);
  if(! myPayDepositResultTxId){
    return {result: 'error', message: 'RaNode failed to pay deposit before Ra'};
  }
  console.log("I have paid deposit, I can start doing Ra now");

  
  const raResult = potSim.verifyPot(pot, false);
  const {pi, vrfHash, threshold} = luckyDrawResult;
  const blockHeight = 0; //placeholder
  // console.log("peerId, potHash, pi, vrfHash, blockHeight, raResult, threshold", {
  //   peerId, potHash, pi, vrfHash, blockHeight, raResult, threshold
  // });
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