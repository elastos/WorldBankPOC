// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign
const IPFS = require('ipfs');
const _ = require( 'lodash');
require("babel-core/register");
require("babel-polyfill");
const { port, env } = require('./config/vars');
const logger = require('./config/logger');
const app = require('./config/express');
const {channelListener} = require('./poc/layerOneBlock/channelListener');
const {generateBlock} = require('./poc/layerOneBlock/generateBlock');
const {utils} = require('vrf.js');

// Get process.stdin as the standard input object.
var standard_input = process.stdin;

// Set input character encoding.
standard_input.setEncoding('utf-8');

// Prompt user to input data in console.
console.clear();
console.log("Please input a random pubsub room postfix. Press enter to get a random number as default:");

// When user input data and click enter key.
standard_input.on('data', function (data) {
  const randRoomPostfix = data? parseInt(data) : Math.round(Math.random()*1000).toString();
  ipfsStart()
  .then((ipfs)=>{
    app.set('ipfs', ipfs);
    app.set('randRoomPostfix', randRoomPostfix);
    console.log("Generating 20 preset users, please wait a few seconds...");
    let presetUsers = [];
    for(let i = 0; i < 20; i ++){
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
    const blockGenerationInterval = 1000*30;
    const firstBlockDelay = 1000 * 10;

    // const loop = async ({ipfs, globalState, blockRoom})=>{
    //   await generateBlock({ipfs, globalState, blockRoom});
    //   _.delay(loop, blockGenerationInterval, {ipfs, globalState, blockRoom});
    // };
    //_.delay(loop, firstBlockDelay, {ipfs, globalState, blockRoom});
    _.delay(generateBlock, firstBlockDelay, {ipfs, globalState, blockRoom});
    //console.log("in index.js init, pubsubRooms in app:", pubsubRooms);
  })

  // listen to requests
  app.listen(port, () => logger.info(`server started on port ${port} (${env})`));

});

const ipfsStart = async ()=>{
  const ipfs = await IPFS.create({
    repo: 'ipfs-storage-no-git/poc/' + Math.random(),
    EXPERIMENTAL: {
      pubsub: true
    },
     config: {
      Addresses: {
        Swarm: [
          //'/dns4/127.0.0.1/tcp/9090/wss/p2p-websocket-star'
          '/ip4/127.0.0.1/tcp/9090/ws/p2p-websocket-star'
        ]
      }
    }
  });
  console.log('IPFS node is ready');
  ipfs.on('error', error=>{
    console.log('IPFS on error:', error);
  });

  ipfs.on('init', error=>{
    console.log('IPFS on init:', error);
  });
  return ipfs;
};

/**
* Exports express
* @public
*/
module.exports = app;
