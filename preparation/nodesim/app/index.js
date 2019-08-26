#!/usr/bin/env node

import colors from 'colors';
import yargs from 'yargs';

import pkg from '../package.json';
import utilities from './utilities';

const OPTIONS = {};

const startApp = ()=>{ 
  
  utilities.title('Starting Trusted Computing Node Simulator');

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

  utilities.exitGraceful();

}

const getOptions = ()=>{

  let argv = yargs
    .version(pkg.version)
    .usage(`Usage: $0 -u user#`)
    .boolean([
      'hacked',
      'leader'
    ])
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
      default: 3,
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
  OPTIONS.hacked = argv.hacked;
  OPTIONS.leader = argv.leader;
  OPTIONS.port = argv.port;

  startApp();

}

getOptions();
