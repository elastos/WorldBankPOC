const express = require('express');
const sha256 = require('js-sha256');
const {creditScore, potSim, remoteAttestationSim, potSchema} = require('../../poc');


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
router
  .route('/newNodeJoin')
  .get(async (req, res) => {
    const {peerId, hacked} = req.query;
    console.log('l32,', peerId, hacked);
    const credit = await creditScore.get(peerId);
    if(credit){
      return res.send("Please change peerID, since this peerId has existed");
    }
    const newCredit = await creditScore.set(peerId, '0');

    console.log('l28', credit);
    const potObj = potSim.createPlaceHolderPot({peerId, hacked});
    console.log('l30', potObj);
    const potHash = sha256(JSON.stringify(potObj));
    console.log('l32', potHash);
    potObj.potHash = potHash;
    const newPotObj = await potSchema.newPot(potObj);
    return res.json(newPotObj);
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
  .route('/set/:id/:score')
  .get(async (req, res, next) => {
    try {
      const { id, score } = req.params;
      console.log('set id, score, ', id, score);
      const r = await creditScore.set(id, score);
      console.log('result is,', r);
      if (r) {
        return res.json(r);
      }
      return next();
    } catch (error) {
      console.log('error line13', error);
      return res.json(error.message);
    }
  });

router
  .route('/potCreateNew')
  .get((req, res, next) => {
    const {peerId, hacked} = req.query;
    const potObj = potSim.createPlaceHolderPot({peerId, hacked});
    if(potObj){
      return res.json(potObj);
    }else{
      return next();
    }
  });

  router
  .route('/potVerify')
  .post((req, res, next) => {
    const {wannaPass} = req.query;
    const {pot} = req.body;
    
    if(potObj){
      return res.json(potObj);
    }else{
      return next();
    }
  })
  .get((req, res) => {
    const {badPot, wannaPass} = req.query;
    const testPot = badPot? potSim.sampleBadPot() : potSim.sampleGoodPot();
    const bForcePass = wannaPass? true: false;
    return res.send( potSim.verifyPot(testPot, bForcePass));
  });

router
  .route('/tryRa')
  .get((req, res, next) => {
    const {peerId} = req.query;
    const newJoinTxHash = '1';
    const privKey = 'placeholderPrivateKey';
    const creditScore = 1000;//placeholder
    remoteAttestationSim.notifyNewJoinNodeNeedRa({newJoinTxHash, peerId, privKey, creditScore});
    const ret = sha256.hex(JSON.stringify({newJoinTxHash, peerId, privKey, creditScore}) );
    res.json(ret);
  });
module.exports = router;
