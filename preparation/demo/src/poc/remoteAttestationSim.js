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
  console.log('lucky draw =>', vrfHash, threshold);
  if(vrfHash < threshold){
    return {result: true, vrfHash, pi, threshold};
    
  }else{
    return {result: false, vrfHash, pi, threshold};
  }
};

const runRaConsensus = async ({potHash}) => {
  const activeRaLogss = await raLogSchema.getAllActiveRaLogFromPotHash({potHash});
  const verifyVrf = (pot) => {
    //placeholder
    return true;
  }
  const verifyPeerCreditAtOriginalHeight = (raLog) =>{
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

  const accum = activeRaLogss.reduce(reducer, {weightedScore:0, raPeerCount:0});
  console.log('accum,', accum);
  if( accum.raPeerCount < 5){
    return {result: false, message:'less than 5 remote attestators, please wait for more attestators to verify', activeRaLogss}
  }else{
    const potIds = activeRaLogss.map(p=>p._id);
    raLogSchema.finalizeRaLogs(potIds);
    
    if(accum.weightedScore < STATIC_THRESHOLD_FOR_REMOTE_ATTESTATION){
      const rewardedGasAndCredit =  await runSmartContractToDistributeGasAndCredit(activeRaLogss, false, potHash);
      return {result: false, message:'we have enough remote attestators, but the result is false', accum, activeRaLogss};
    }else{
      const rewardedGasAndCredit =  await runSmartContractToDistributeGasAndCredit(activeRaLogss, true, potHash);
      return {result: true, message:'we have enough remote attestators support you. Welcome to our trusted network', rewardedGasAndCredit, accum, activeRaLogss};
    }
  }
   
};

const runSmartContractToDistributeGasAndCredit = async (activeRaLogs, raResult, potHash)=>{
  //those ra nodes who vote result is the same is final result get reward, thsoe ra nodes who vote against the final result get penalty
  const reducer = async (accum, current) => {
    accum = await accum;

    const {peerId, myPayDepositResultTxId} = current;
    if(current.raResult == raResult){//this RA actually WIN the Ra, so this node should be reward
      accum.rewardPeer.push(peerId);
      
    } else{  //this node against the final result. this user should be pentalty
      accum.pentaltyPeer.push(peerId);
    }

    const raNodeDepositGas = await txLogSchema.txByTxId(myPayDepositResultTxId);
    accum.rewardPoolGas += raNodeDepositGas;

    return accum;
  };

  // const accum = activePots.reduce(reducer, {rewardPeer:[], penaltyPeer:[], rewardPoolGas:0});
  const accum = await activeRaLogs.reduce(reducer, Promise.resolve({rewardPeer:[], penaltyPeer:[], rewardPoolGas:0}));
  const rewardGasToEachWinnerPeer = accum.rewardPoolGas / accum.rewardPeer.length;
  const rewardCreditToEachWinnerPeer = constValue.creditPentaltyToEverySuccessfulRa;
  const penaltyCreditToEachLoserPeer = constValue.creditPentaltyToEverySuccessfulRa;

  const RewardPeersTxList = accum.rewardPeer.map(async (peerId) => {
    const creditRewardTxId = await creditScoreSim.withdrawFromReserve(peerId, rewardGasToEachWinnerPeer);
    const gasRewardTxId = await gasSim.transferGasFromEscrow(peerId, rewardGasToEachWinnerPeer, "RaReward_ref_potHash", potHash);
    return {peerId, creditRewardTxId, gasRewardTxId};
  });
  const PenaltyPeersTxList = accum.penaltyPeer.map(async (peerId) => {
    const creditPentaltyTxId = await creditScoreSim.withdrawFromReserve(peerId, penaltyCreditToEachLoserPeer);
    return {peerId, creditPentaltyTxId};
  });
  
  return {RewardPeersTxList, PenaltyPeersTxList};
};


const payEqualDepositToStartRa =  async (myPeerId, depositGasTxId)=>{
  const originalDepositTxObj = await txLogSchema.txByTxId(depositGasTxId);
  const {amt, referenceEventType, referenceEventId} = originalDepositTxObj;
  const rs = await gasSim.transferGasToEscrow(myPeerId, amt, referenceEventType, referenceEventId);

  // return tx id;
  return rs._id;
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
  const depositGasTxIdValidation = ({fromPeerId, toPeerId, amt, tokenType, referenceEventType, referenceEventId})=>{
    if(fromPeerId != constValue.gasFaucetPeerId){
      if(fromPeerId != peerId) return false;
    }
    if(amt < 10)  return false;
    
    if(tokenType != 'gas') return false;
    if(referenceEventType != 'NewNodeJoinDepositGas_ref_peerId') return false;
    if((referenceEventId != constValue.gasFaucetPeerId) && (referenceEventId != peerId)) return false;
    return true;
  };
  if(! await txLogSchema.doValidationOnGasTx(depositGasTxId, depositGasTxIdValidation)){
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

  if(myPayDepositResultTxId.err){
    return {result: 'error', message: myPayDepositResultTxId.err};
  }
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
    peerId, potHash, pi, vrfHash, myPayDepositResultTxId, blockHeight, creditScoreAtBlockHeightTime: creditScore, raResult, threshold
  });


  const currentRaConsensusResult = await runRaConsensus({potHash});
  return {result:true, raResult, currentRaConsensusResult};
  //ethSim.signRaTask('sigPlaceHolder', newJoinTxHash, pi, raResult);


};

exports.notifyNewJoinNodeNeedRa = ({newJoinTxHash, peerId, privKey, creditScore}) => {
  const inputHash = newJoinTxHash;
  
};