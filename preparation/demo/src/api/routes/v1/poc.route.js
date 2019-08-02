const express = require('express');

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


module.exports = router;
