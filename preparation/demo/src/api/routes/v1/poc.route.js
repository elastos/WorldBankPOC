const express = require('express');

const Credit = require('../../../poc/creditScore');


const router = express.Router();

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
  .get(async (req, res, next)=>{
    try{
      const id = req.params.id;
      const credit = await Credit.get(id);
      console.log("credit is,", credit);
      if(credit)
        return res.json(credit);
      next();
    }catch (error) {
      console.log("error line13", error);
      res.json(error.message);
    
    }
  });

  router
  .route('/set/:id/:score')
  .get(async (req, res, next)=>{
    try{
      const id = req.params.id;
      const score = req.params.score;
      console.log("set id, score, ", id, score);
      const r = await Credit.set(id, score);
      console.log("result is,", r);
      if(r){
        return res.json(r);
      }
      next();
    }catch (error) {
      console.log("error line13", error);
      res.json(error.message);
    
    }
  });



module.exports = router;


