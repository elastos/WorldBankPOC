const express = require('express');

const pocRoutes = require('./poc.route');

const router = express.Router();

/**
 * GET status
 */
router.get('/status', (req, res) => res.send('OK'));
console.log('dir', __dirname );
/**
 * GET docs
 */
router.use('/', express.static(__dirname + '/docs'));

router.use('/poc', pocRoutes);


module.exports = router;
