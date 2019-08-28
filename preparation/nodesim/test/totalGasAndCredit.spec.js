import {describe, it, before} from 'mocha';
import TotalGasAndCredit from '../shared/totalGasAndCredit';
import BlockMgr from '../shared/blockMgr';
import _ from 'lodash';
import {ipfsInit} from '../nodes/ipfsInit';

import chai, { expect, should } from 'chai';
should();
import chaiAsPromised from "chai-as-promised";
import 'babel-polyfill';
import { isIterable } from 'core-js';
chai.use(chaiAsPromised);

describe.skip('totalGasAndCredit', ()=>{
  before(async()=>{
    const ipfs = global.ipfs? global.ipfs : await ipfsInit( 'local');
      const blockMgr = new BlockMgr(ipfs)
      console.log('bockMgr initialized');
      global.ipfs = ipfs;
      global.blockMgr = blockMgr;
  })
  it('correctly calculate total gas and total credit and online only', async ()=>{
    const totalGasAndCredit = new TotalGasAndCredit();
    const empty = totalGasAndCredit.getCurrentTotalGasAndCredit();
    expect(empty).to.eql({
      totalGas:0,
      totalCredit:0,
      totalCreditForOnlineNodes:0,
      height:0
    });

    const block1 = {
      gasMap:{
        'user #0': 0,
        'user #1': 10,
        'user #2': 20
      },
      creditMap:{
        'user #0': 0,
        'user #1': 1,
        'user #2': 2
      },
      totalCreditForOnlineNodes:{
        'user #0':{

        },
        'user #2':{
        }
      }
    };
    const{ipfs, blockMgr} = global;
    const blockCid = (await ipfs.dag.put(block1)).toBaseEncodedString();
    blockMgr.registerNewBlockEventHandler(totalGasAndCredit.updateOnNewBlock);
    blockMgr.pushNewBlock(1, blockCid);
    _.delay(()=>{
      const currentGasAndCredit = totalGasAndCredit.getCurrentTotalGasAndCredit();
      expect(currentGasAndCredit).to.eql({
        totalGas:30,
        totalCredit:3,
        totalCreditForOnlineNodes:2,
        height:1
      })
    }, 
    1000)
    
  })
})