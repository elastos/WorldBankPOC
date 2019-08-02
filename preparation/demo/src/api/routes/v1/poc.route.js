const express = require('express');
const validate = require('express-validation');

const router = express.Router();



router
  .route('/')
  .get(function (req, res) {
    res.send('You are doing great')
  });

  router
  .route('/status')
  .get(function (req, res) {
    res.send('You will see updates here')
  });
  router
  .route('/newNodeJoin')
  .get(function(req,res){
    res.send("please post")
  })
  .post(function (req, res) {
    res.send('Post here')
  });


module.exports = router;
