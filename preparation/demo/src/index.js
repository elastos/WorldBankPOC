// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign
require("babel-core/register");
require("babel-polyfill");
const { port, env } = require('./config/vars');
const logger = require('./config/logger');
const app = require('./config/express');
const mongoose = require('./config/mongoose');
const {ipfsStart} = require('./poc/ipfsMod');

app.set('json spaces', 2);
// open mongoose connection
mongoose.connect();

// listen to requests

app.listen(port, () => logger.info(`server started on port ${port} (${env})`));
ipfsStart(app);
/**
* Exports express
* @public
*/
module.exports = app;
