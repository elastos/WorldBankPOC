import {describe, it, before} from 'mocha';
import BlockMgr from '../shared/blockMgr';
import {ipfsInit} from '../nodes/ipfsInit';
var assert = require('assert');
import chai, { expect, should } from 'chai';
should();
import chaiAsPromised from "chai-as-promised";
import 'babel-polyfill';
import events from 'events';
import {ipfsInit, pubsubInit} from '../nodes/ipfsInit';


chai.use(chaiAsPromised);

describe('rpcMessageEvents', ()=>{
  describe('events', async ()=>{
    
    before(async ()=>{
      const ipfs = global.ipfs? global.ipfs : await ipfsInit( 'local');
      const blockMgr = new BlockMgr(ipfs)
      console.log('bockMgr initialized');
      global.ipfs = ipfs;
      global.rpcEvent = new events.EventEmitter();
      const rooms = await pubsubInit(ipfs, "", global.rpcEvent);
    })
    it.skip('on townHall event', ()=>{
      try{
        global.rpcEvent.emit('rpcRequest', {first:'hello', next:'world'});
        global.rpcEvent.emit('rpcResponseWithNewRequest', {first:'hello', next:'world'});
        global.rpcEvent.emit('rpcResponse', {first:'hello', next:'world'});
      }
      catch(e){
        console.log(e);
        
      }
    })
  })
});