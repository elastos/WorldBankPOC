// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign
const _ = require( 'lodash');
require("babel-core/register");
require("babel-polyfill");
const { port, env } = require('./config/vars');
const logger = require('./config/logger');
const app = require('./config/express');
const {ipfsStart} = require('./poc/ipfsMod');
const {channelListener} = require('./poc/layerOneBlock/channelListener');
const {generateBlock} = require('./poc/layerOneBlock/generateBlock');
const {utils} = require('vrf.js');
//const blockService = require('./service/BlockServices');
// open mongoose connection
//mongoose.connect();




ipfsStart()
.then((ipfs)=>{
  app.set('ipfs', ipfs);
  const randRoomPostfix = Math.round(Math.random()*1000).toString();//Every time we start the server, we create a new rand string so that the pub sub channel would be different each time. This will help debuging since other users may also use the same code base to test and publish message to the same room
  app.set('randRoomPostfix', randRoomPostfix);
  console.log("Generating 100 preset users, please wait a few seconds...");
  let presetUsers = [];
  for(let i = 0; i < 100; i ++){
    const [publicKey, privateKey] = utils.generatePair();
    const u ={
      name:'user #' + i,
      pub:publicKey.toString('hex'),
      pri:privateKey.toString('hex')
    }
    presetUsers.push(u);
  }
  console.log("presetUsers,", presetUsers);
  app.set('presetUsers', presetUsers);
  return channelListener(app.get('ipfs'), randRoomPostfix, presetUsers);
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
