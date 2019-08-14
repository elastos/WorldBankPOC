// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign
const _ = require( 'underscore');
require("babel-core/register");
require("babel-polyfill");
const { port, env } = require('./config/vars');
const logger = require('./config/logger');
const app = require('./config/express');
const {ipfsStart} = require('./poc/ipfsMod');
const {channelListener} = require('./poc/layerOneBlock/channelListener');
const {generateBlock} = require('./poc/layerOneBlock/generateBlock');
//const blockService = require('./service/BlockServices');
// open mongoose connection
//mongoose.connect();



ipfsStart(app)
.then((ipfs)=>{
  app.set('ipfs', ipfs);
  return channelListener(app.get('ipfs'));
})
.then(({ipfs, globalState, pubsubRooms})=>{
  app.set('pubsubRooms', pubsubRooms);
  app.set('globalState', globalState);
  const {blockRoom} = pubsubRooms;
  const s = 1000*6;

  const loop = async ({ipfs, globalState, blockRoom})=>{
    await generateBlock({ipfs, globalState, blockRoom});
    _.delay(loop, s, {ipfs, globalState, blockRoom});
    // setTimeout(async ({globalState, blockRoom})=>{
    //   await loop({globalState, blockRoom});
    // }, s);
  };

  _.delay(loop, s, {ipfs, globalState, blockRoom});
  //console.log("in index.js init, pubsubRooms in app:", pubsubRooms);
})
//blockService.init(app);

// listen to requests
app.listen(port, () => logger.info(`server started on port ${port} (${env})`));

/**
* Exports express
* @public
*/
module.exports = app;
