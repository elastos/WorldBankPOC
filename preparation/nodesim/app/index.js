#!/usr/bin/env node

import colors from 'colors';
import yargs from 'yargs';

import pkg from '../package.json';
import utilities from './utilities';
import ipfsInit from './ipfsInit';
const OPTIONS = {};

const startApp = async ()=>{ 
  
  utilities.title('Starting Trusted Computing Node Simulator');
  utilities.o('log', 'options:', OPTIONS);

  const ipfs = await ipfsInit(OPTIONS.swarm);

  // if (utilities.dirExists(OPTIONS.directory)) {

  //   utilities.o('log', 'Hello.'.green);
  //   utilities.o(
  //     'log',
  //     OPTIONS.directory,
  //     OPTIONS.foo,
  //     OPTIONS.baz,
  //     OPTIONS.other
  //   );
  //   utilities.o('log', 'Goodbye.'.red);

  // } else {

  //   utilities.o('log', `Chosen directory does not exist: ${OPTIONS.directory}`.red.bold);
  //   utilities.o('log', 'Double check your path and try again'.toUpperCase().rainbow);

  // }

  utilities.done({text:'Ctrl - C to exit'});
  
}

const getOptions = ()=>{

  let argv = yargs
    .version(pkg.version)
    .usage(`Usage: $0 -u user#`)
    .boolean([
      'hacked',
      'leader'
    ])
    .option('swarm', {
      alias:[
        's',
      ],
      description:'Local, default or an IPFS swarm URL',
      type:'string',
      default:'/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
    })
    .option('hacked', {
      alias: [
        'h',
      ],
      description: 'Force this node perform as a hacked node',
      type: 'boolean',
    })
    .option('leader', {
      alias: [
        'l',
      ],
      description: 'Force this node to become the leader for debug purpose',
      type: 'boolean',
    })
    .option('port', {
      alias: [
        'p',
      ],
      description: 'Web monitor port number',
      type: 'number',
      default: 2999,
    })
    .option('user', {
      alias: [
        'u',
      ],
      description: 'Node user name',
      type: 'string',
      //demand: true,
    })
    .alias('h', 'help')
    .help('h', 'Show help.')
    .argv;

  OPTIONS.user = argv.user;
  OPTIONS.swarm = argv.swarm;
  OPTIONS.hacked = argv.hacked;
  OPTIONS.leader = argv.leader;
  OPTIONS.port = argv.port;

  startApp();

}

getOptions();
