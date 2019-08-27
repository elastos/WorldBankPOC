const IPFS = require('ipfs');
const _ = require( 'lodash');
// require("babel-core/register");
// require("babel-polyfill");

const {channelListener} = require('./channelListener');
const {generateBlock} = require('./generateBlock');
const {utils} = require('vrf.js');
import inquirer from 'inquirer';


// Prompt user to input data in console.
console.clear();
const app = require('./config/express');

var questions = [{
  type: 'input',
  name: '',
  message: ""
}]

inquirer.prompt([
    {
      type:'input',
      name:'swarmUrl',
      message:'IP address of your IPFS swarm server. Or type "local" for 127.0.0.1. If leave it blank the defalt is /dns4/127.0.0.1/tcp/9090/wss/p2p-websocket-star',
      default:()=>{
        return '';
      }
    },
    {
      type:'input',
      name:'blockGenerationInterval',
      message:'Please input the interval of auto block generation in seconds or leave it blank to manually generate',
      default:()=>{
        return 0;
      }
    },
    {
      type:'input',
      name:'roomPostfixUserInput',
      message:'In order to prevent conflicts between different testing users, please input a random pubsub room postfix. Leave it blank will auto generate a random number as the default',
      default: ()=>{
        return '';//Math.round(Math.random()*1000).toString();
      }
    }
  ]
).then(answers => {
  let swarmUrl;
  if(answers['swarmUrl'] == 'local'){
    swarmUrl = '/ip4/127.0.0.1/tcp/9090/ws/p2p-websocket-star';
  }else if(answers['swarmUrl'] == ''){
    swarmUrl = '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star';
  }else{
    swarmUrl = '/ip4/' + answers['swarmUrl'] + '/tcp/9090/ws/p2p-websocket-star';
  }
  console.log('swarmUrl:', swarmUrl);
  const roomPostfixUserInput = answers['roomPostfixUserInput'];
  const blockGenerationInterval = parseInt(answers['blockGenerationInterval']) * 1000;  
  main(roomPostfixUserInput, blockGenerationInterval, swarmUrl);
  
});



const main = (randRoomPostfix, blockGenerationInterval, swarmUrl)=>{
  ipfsStart(swarmUrl)
  .then((ipfs)=>{
    app.set('swarmUrl', swarmUrl);
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
    //
    console.log("presetUsers,", presetUsers);
    app.set('presetUsers', presetUsers);
    return channelListener(app.get('ipfs'), randRoomPostfix, presetUsers);
  })
  .then(({ipfs, globalState, pubsubRooms})=>{
    app.set('pubsubRooms', pubsubRooms);
    app.set('globalState', globalState);
    const {blockRoom} = pubsubRooms;
    const firstBlockDelay = 1000 * 10;
    if(blockGenerationInterval > 0){
      const loop = async ({ipfs, globalState, blockRoom})=>{
        await generateBlock({ipfs, globalState, blockRoom});
        _.delay(loop, blockGenerationInterval, {ipfs, globalState, blockRoom});
      }
      _.delay(loop, firstBlockDelay, {ipfs, globalState, blockRoom});
      console.log("Automacial block genreation starts. New block will be generated every" + blockGenerationInterval + ' seconds');
    }
    else{
      _.delay(generateBlock, firstBlockDelay, {ipfs, globalState, blockRoom});
      console.log("No automatical block generation after the genesis block. You have to manually force generate new block every time!")
    }

  })

  // listen to requests
  app.listen(3000, () => console.log(`server started`));

};

const ipfsStart = async (swarmUrl)=>{
  
  const ipfs = await IPFS.create({
    repo: 'ipfs-storage-no-git/poc/' + Math.random(),
    EXPERIMENTAL: {
      pubsub: true
    },
     config: {
      Addresses: {
        Swarm: [
          //'/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
          //'/ip4/127.0.0.1/tcp/9090/ws/p2p-websocket-star'
          swarmUrl
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
