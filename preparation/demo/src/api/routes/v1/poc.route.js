const express = require('express');

const {creditScore, potSim} = require('../../../poc');


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
  .get((req, res) => {
    res.send('please post');
  })
  .post((req, res) => {
    res.send('Post here');
  });

router
  .route('/checkCredit/:id')

  .get(async (req, res, next) => {
    try {
      const { id } = req.params;
      console.log("line34, id", id);
      const credit = await creditScore.get(id);
      console.log('credit is,', credit);
      if (credit) {
        return res.json(credit);
      }
      return next();
    } catch (error) {
      console.log('error line13', error);
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
module.exports = router;
