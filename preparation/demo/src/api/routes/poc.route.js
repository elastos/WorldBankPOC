const express = require('express');
const sha256 = require('js-sha256');
const {creditScore, potSim, remoteAttestationSim, potSchema, betterResponse, gasSim, result, constValue, txLogSchema} = require('../../poc');


const router = express.Router();
console.log("credit", creditScore);
router
  .route('/')
  .get((req, res) => {
    res.send('You are doing great');
  });

router
  .route('/status')
  .get((req, res) => {
    res.send('You will see updates here');
  });

  //newJoinNodeDeposit
router
  .route('/newJoinNodeDeposit')
  .get(async (req, res) => {
    const {peerId, depositGasAmt} = req.query;
    const credit = await creditScore.get(peerId);
    if(credit){
      return betterResponse.responseBetterJson(res, {peerId, depositGasAmt}, {error:'Please change peerID, since this peerId has existed'});
    }
    if(! depositGasAmt){
      return betterResponse.responseBetterJson(res, {peerId, depositGasAmt}, {error:'Deposit gas for intial remote attestion need to be more than 10'});
    }
    const depositGasAmtNumber = Number.parseInt(depositGasAmt);
    if (depositGasAmtNumber < 10){
      return betterResponse.responseBetterJson(res, {peerId, depositGasAmt}, {error:'Deposit gas for intial remote attestion need to be more than 10'});
    }
    console.log('depositGasAmtNumber', depositGasAmtNumber)
    const gasTransactionId = await gasSim.transferGasToEscrow(peerId, depositGasAmtNumber, "NewNodeJoinDepositGas_ref_peerId", peerId);
    betterResponse.responseBetterJson(res, {peerId, depositGasAmt}, {gasTransactionId});
  });

router
  .route('/newNodeJoin')
  .get(async (req, res) => {
    const {peerId, hacked, depositGasTxId, json, lat, lng} = req.query;
    const credit = await creditScore.get(peerId);
    if(credit){
      if(json){
        return result(res, -1, 'Please change peerID, since this peerId has existed');
      }
      return betterResponse.responseBetterJson(res, {peerId, hacked, depositGasTxId}, {error:'Please change peerID, since this peerId has existed'});
    }
    if(! depositGasTxId){
      if(json){
        return result(res, -1, 'In order to join the trusted network, you have to pay a init gas fee for other trusted nodes to give you an approval based on PoT value. This is called Remote Attestation. Please attach the txId of your deposit to Escrow account');
      }
      return betterResponse.responseBetterJson(res, {peerId, hacked, depositGasTxId}, {error:'In order to join the trusted network, you have to pay a init gas fee for other trusted nodes to give you an approval based on PoT value. This is called Remote Attestation. Please attach the txId of your deposit to Escrow account'});
    
    }
    const depositGasTxIdValidation = ({fromPeerId, toPeerId, amt, tokenType, referenceEventType, referenceEventId})=>{
      if(fromPeerId != constValue.gasFaucetPeerId){
        if(fromPeeId != peerId) return false;
      }
      if(amt < 10)  return false;
      
      if(tokenType != 'gas') return false;
      if(referenceEventType != 'NewNodeJoinDepositGas_ref_peerId') return false;
      if((referenceEventId != constValue.gasFaucetPeerId) && (referenceEventId != peerId)) return false;
      return true;
    };
    if(! await txLogSchema.doValidationOnGasTx(depositGasTxId, depositGasTxIdValidation)){
      return betterResponse.responseBetterJson(res, {peerId, hacked, depositGasTxId}, {error:'We cannot find the Proof of Payment from the TxId You attached. In order to join the trusted network, you have to pay a init gas fee for other trusted nodes to give you an approval based on PoT value. This is called Remote Attestation. Please attach the txId of your deposit to Escrow account'});
  
    }
    
    const newCredit = await creditScore.set(peerId, '0');

    const potObj = potSim.createPlaceHolderPot({peerId, hacked: hacked == 'true'});

    const potHash = sha256(JSON.stringify(potObj));
    potObj.potHash = potHash;
    potObj.location = [lat || 0, lng || 0];
    const newPotObj = await potSchema.newPot(potObj);
    if(json){
      return result(res, 1, newPotObj);
    }
    betterResponse.responseBetterJson(res, {peerId, hacked}, {newPotObj});
  });

router
  .route('/checkCredit/:id')

  .get(async (req, res, next) => {
    try {
      const { id } = req.params;
      const credit = await creditScore.get(id);
      if (credit) {
        return res.json(credit);
      }
      return next();
    } catch (error) {
      return res.json(error.message);
    }
  });

router
  .route('/setPeerScore')
  .get(async (req, res) => {
    try {
      const { peerId, score } = req.query;
      const r = await creditScore.set(peerId, score);
      return betterResponse.responseBetterJson(res, req.query, {r});
    } catch (error) {
      console.log('error line13', error);
      return res.json(error.message);
    }
  });

  // router
  // .route('/potVerify')
  // .post((req, res, next) => {
  //   const {wannaPass} = req.query;
  //   const {pot} = req.body;
    
  //   if(potObj){
  //     return res.json(potObj);
  //   }else{
  //     return next();
  //   }
  // })
  // .get((req, res) => {
  //   const {badPot, wannaPass} = req.query;
  //   const testPot = badPot? potSim.sampleBadPot() : potSim.sampleGoodPot();
  //   const bForcePass = wannaPass? true: false;
  //   return res.send( potSim.verifyPot(testPot, bForcePass));
  // });

router
  .route('/tryRa')
  .get(async (req, res, next) => {
    const {peerId, potHash} = req.query;
    const result = await remoteAttestationSim.tryRa({peerId, potHash});
    betterResponse.responseBetterJson(res, {peerId, potHash}, result);
  });
module.exports = router;
