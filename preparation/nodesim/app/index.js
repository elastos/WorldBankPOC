#!/usr/bin/env node

import colors from 'colors';
import yargs from 'yargs';

import pkg from '../package.json';
import {o, done} from './utilities';
import {ipfsInit, pubsubInit} from './ipfsInit';

const OPTIONS = {};

const startApp = async ()=>{ 

  o('log', 'options:', OPTIONS);


  ipfsInit(OPTIONS.swarm)
  .then((ipfs)=>{
    return pubsubInit(ipfs, OPTIONS.randRoomPostfix);
  })
  .then(({townHall, taskRoom, blockRoom})=>{
    console.log('pubsubInit done');
  })
  .catch(err=>{
    console.log('error in promises,', err);
  });
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
    .options('randRoomPostfix', {
      alias:[
        'r',
      ],
      description:'Specify a random string as pub sub room name postfix.',
      type:'string',
      default:''
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
  OPTIONS.randRoomPostfix = argv.randRoomPostfix;
  OPTIONS.hacked = argv.hacked;
  OPTIONS.leader = argv.leader;
  OPTIONS.port = argv.port;

  startApp();

}

getOptions();
