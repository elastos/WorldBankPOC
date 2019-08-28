import {describe, it, before} from 'mocha';
import PeerUserCache from '../layerOne/onlinePeerUser';
import {ipfsInit} from '../nodes/ipfsInit';
var assert = require('assert');
import chai, { expect, should } from 'chai';
should();
import chaiAsPromised from "chai-as-promised";
import 'babel-polyfill';
chai.use(chaiAsPromised);

describe('onlinePeerUserCache', ()=>{
  it('init empty', ()=>{
    const peerUserCache = new PeerUserCache();
    const item1 = {peerId:'p1', userName:'u1', payload:{hello:'world'}};
    const item2 = {peerId:'p2', userName:'u2', payload:{world:'hello'}};
    peerUserCache.put(item1.peerId, item1.userName, item1.payload);
    peerUserCache.put(item2.peerId, item2.userName, item2.payload);
    expect(peerUserCache.getByUserName(item1.userName)).to.eql(item1);
    expect(peerUserCache.getByUserName(item2.userName)).to.eql(item2);
    expect(peerUserCache.getByPeerId(item1.peerId)).to.eql(item1);
    expect(peerUserCache.getByPeerId(item2.peerId)).to.eql(item2);
    expect(()=>peerUserCache.put(item1.peerId, "whateverUserName")).to.throw('peerId exists. Please remove first');
    expect(()=>peerUserCache.put("whateverPeerId", item2.userName)).to.throw('userName exists. Please remove first');

    peerUserCache.removeByUserName(item1.userName);
    peerUserCache.removeByUserName(item1.userName);//show be OK if you try to delete the same thing again
    peerUserCache.removeByPeerId(item1.peerId);//gracefull 
    peerUserCache.removeByPeerId(item2.peerId);
    peerUserCache.removeByUserName(item2.userNme);

    expect(peerUserCache.getByUserName(item1.userName)).to.be.undefined;
    expect(peerUserCache.getByUserName(item2.userName)).to.be.undefined;
    expect(peerUserCache.getByPeerId(item1.peerId)).to.be.undefined;

    peerUserCache.put(item1.peerId, item1.userName, item1.payload);
    peerUserCache.put(item2.peerId, item2.userName, item2.payload);
    expect(peerUserCache.getByUserName(item1.userName)).to.eql(item1);
    expect(peerUserCache.getByUserName(item2.userName)).to.eql(item2);
    expect(peerUserCache.getByPeerId(item1.peerId)).to.eql(item1);
    expect(peerUserCache.getByPeerId(item2.peerId)).to.eql(item2);
    
    
  })
})