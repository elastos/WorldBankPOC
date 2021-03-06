const express = require('express');

const pocRoutes = require('./poc.route');

const router = express.Router();

/**
 * GET status
 */
router.get('/status', (req, res) => res.send('OK'));
//console.log('dir', __dirname );
/**
 * GET docs
 */
router.use('/', express.static(__dirname + '/docs'));
router.use('/web', express.static(process.cwd() + '/web'));
router.use('/poc', pocRoutes);

// set webprotal folder as static
router.use('/webportal', express.static(process.cwd() + '/webportal'));


module.exports = router;
