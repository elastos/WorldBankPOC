import {describe, it, beforeEach} from 'mocha';
import BlockMgr from '../shared/blockMgr';
import {ipfsInit} from '../nodes/ipfsInit';
var assert = require('assert');
import chai, { expect, should } from 'chai';
should();
import chaiAsPromised from "chai-as-promised";
import 'babel-polyfill';
chai.use(chaiAsPromised);

describe('blockMgr', ()=>{
  describe('blockMgr clear', async ()=>{
    
    beforeEach(async ()=>{
      const ipfs = global.ipfs? global.ipfs : await ipfsInit( 'local');
      global.ipfs = ipfs;
      
    })
    it('new blockMgr should be empty', ()=>{
      console.log('inside new block mgr shoudl be empty')
      try{
        const{ipfs} = global;
        const blockMgr = new BlockMgr(ipfs)
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
      const{ipfs} = global;
      const blockMgr = new BlockMgr(ipfs)
      
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
      const blockMgr = new BlockMgr(ipfs)
      
      const placeHolder = {placeholder:'nothing'};
      const placeHolderCid = (await ipfs.dag.put(placeHolder)).toBaseEncodedString();
      const currentBlockHeight = blockMgr.getLatestBlockHeight();
      const nextBlockHeight = currentBlockHeight + 1;
      
      blockMgr.registerNewBlockEventHandler(({height, cid})=>{
        expect(height).to.be.equal(nextBlockHeight);
        expect(cid).to.be.equal(placeHolderCid);
        delete global.shouldBeRemovedIfEventHandlerIsCalled;
      })
      blockMgr.pushNewBlock(nextBlockHeight, placeHolderCid);
      expect(global.shouldBeRemovedIfEventHandlerIsCalled).to.be.undefined;
    })

    it('reRunFunctionWhenNewBlockArrive', async ()=>{
      const blockMgr = new BlockMgr(ipfs)
      
      global.shouldBeRemovedIfEventHandlerIsCalled = "whatever";
      
      const placeHolder = {placeholder:'nothing'};
      const placeHolderCid = (await ipfs.dag.put(placeHolder)).toBaseEncodedString();
      const currentBlockHeight = blockMgr.getLatestBlockHeight();
      const nextBlockHeight = currentBlockHeight + 1;
      const deferedFunction = (firstArg, secondArg)=>{

        if(blockMgr.getLatestBlockHeight() != nextBlockHeight){
          return blockMgr.reRunFunctionWhenNewBlockArrive(deferedFunction, "hello", "world");
        }
        expect(blockMgr.getLatestBlockHeight()).to.be.equal(nextBlockHeight);
        
        expect(firstArg).to.equal('hello');
        expect(secondArg).to.equal('world');
      
        delete global.shouldBeRemovedIfEventHandlerIsCalled;
        console.log('actually delete')
      };
      deferedFunction('hello', 'world');
      blockMgr.pushNewBlock(nextBlockHeight, placeHolderCid);
      console.log('block pushed');
      expect(global.shouldBeRemovedIfEventHandlerIsCalled).to.be.undefined;
    })

  });
});