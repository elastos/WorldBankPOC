import BlockMgr from '../nodes/blockMgr';
import {ipfsInit} from '../nodes/ipfsInit';

import chai, { expect, should } from 'chai';
should();
import chaiAsPromised from "chai-as-promised";
import 'babel-polyfill';
chai.use(chaiAsPromised);

describe('blockMgr', ()=>{
  describe('blockMgr clear', async ()=>{
    
    before(async ()=>{
      const ipfs = await ipfsInit( 'local');
      const blockMgr = new BlockMgr(ipfs)
      console.log('bockMgr initialized');
      global.ipfs = ipfs;
      global.blockMgr = blockMgr;
    })
    it('new blockMgr should be empty', ()=>{
      console.log('inside new block mgr shoudl be empty')
      try{
        const{ipfs, blockMgr} = global;
        const maxHeight = blockMgr.getMaxHeight();
        expect(maxHeight).to.equals(0);
        const block0 = blockMgr.getBlockCidByHeight(0);
        expect(block0).to.be.undefined;
        const block100 = blockMgr.getBlockCidByHeight(100);
        expect(block100).to.be.undefined;
        
      }
      catch(e){
        console.log(e);
        
      }
    });

    it('new blockMgr push a new block, the block cache should be empty', async ()=>{
      const{ipfs, blockMgr} = global;
      const placeHolder = {placeholder:'nothing'};
      const placeHolderCid = (await ipfs.dag.put(placeHolder)).toBaseEncodedString();
      blockMgr.pushNewBlock(8, placeHolderCid);
      const block8Cid = blockMgr.getBlockCidByHeight(8);
      expect(block8Cid).to.equals(placeHolderCid);
      const block9Cid = blockMgr.getBlockCidByHeight(9);
      expect(block9Cid).to.be.undefined;
      const block8 = await blockMgr.getBlockByHeight(8);
      expect(block8).to.eql(placeHolder);
      const block9 = await blockMgr.getBlockByHeight(9);
      expect(block9).to.be.undefined;
      
    })  

    it('register registerNewBlockEventHandler function should get called when new block pushed', async ()=>{
      global.shouldBeRemovedIfEventHandlerIsCalled = "whatever";
      
      const placeHolder = {placeholder:'nothing'};
      const placeHolderCid = (await ipfs.dag.put(placeHolder)).toBaseEncodedString();
      blockMgr.registerNewBlockEventHandler(({height, cid})=>{
        expect(height).to.be.equal(10);
        expect(cid).to.be.equal(placeHolderCid);
        delete global.shouldBeRemovedIfEventHandlerIsCalled;
      })
      blockMgr.pushNewBlock(10, placeHolderCid);
      expect(global.shouldBeRemovedIfEventHandlerIsCalled).to.be.undefined;
    })


  });
});