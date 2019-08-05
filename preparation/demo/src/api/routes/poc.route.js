const express = require('express');
const sha256 = require('js-sha256');
const {creditScore, potSim, remoteAttestationSim, potSchema, betterResponse, gasSim, result} = require('../../poc');

const _ = require('lodash');

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
    console.log("l24", req.query);
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
    const newCredit = await creditScore.set(peerId, '0');

    const potObj = potSim.createPlaceHolderPot({peerId, hacked: hacked == 'true'});

    const potHash = sha256(JSON.stringify(potObj));
    potObj.potHash = potHash;
    potObj.location = [lat, lng];
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
      const { peerId, score, json } = req.query;
      const r = await creditScore.set(peerId, score);
      if(json){
        return result(res, 1, r);
      }
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

router
  .route('/potList')
  .get(async (req, res)=>{
    let list = await potSchema.getAll();
    const ids = _.map(list, (item)=>{
      return item.peerId;
    });
    const cs = await creditScore.find({
      peerId : {
        $in : ids
      }
    }).exec();
    list = _.map(list, (item)=>{
      const tmp = _.find(cs, (x)=>x.peerId===item.peerId);
      const rs = {
        ...item.toJSON(),
        creditScore : tmp.creditScore
      };
      return rs;
    });
    return result(res, 1, list);
  });

router
  .route('/deletePot')
  .get(async (req, res)=>{
    const {peerId} = req.query;
    
    try{
      await creditScore.remove({peerId});
      await potSchema.remove({peerId});

      return result(res, 1, 'ok');
    }catch(e){
      return result(res, -1, e.toString());
    }
    

    
  });
module.exports = router;
