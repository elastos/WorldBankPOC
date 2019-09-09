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
    const rooms = [];
    const rpcEvents = [];
    const broadcastEvents = [];
    const peers = [];

    before(async ()=>{
      for (let i = 0; i < 3; i ++) {
        const ipfs =  await ipfsInit( 'local');
        peers.push(ipfs._peerInfo.id.toB58String());
        const rpcEvent = new events.EventEmitter();
        rpcEvents.push(rpcEvent);
        const broadcastEvent = new events.EventEmitter();
        broadcastEvents.push(broadcastEvent);
        rooms.push(await pubsubInit(ipfs, "test", rpcEvent, broadcastEvent));
      }
      
    })
    it('rpc Request should get response', ()=>{
      try{

        rpcEvents[0].emit('rpcRequest', {
          sendToPeerId:peers[1],
          message:JSON.stringify({
            type:'ping'
          }),
          responseCallBack:(res, err)=>{
            console.log("I have got peer 1 response,", res, err)
          }
        });

        
      }
      catch(e){
        console.log(e);
        
      }
    })
  })
});