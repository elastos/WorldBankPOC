import chai, { expect, should } from 'chai';
import {describe, it, before} from 'mocha';

import chaiAsPromised from "chai-as-promised";
import 'babel-polyfill';
chai.use(chaiAsPromised);

import ipfsInit from '../nodes/ipfsInit';

describe.skip('IPFS', ()=>{
  describe('ipfs init', ()=>{
    it('ipfs init with option default to local. This test intend to end with pending.',async ()=>{
      const ipfs = await ipfsInit('local');
      expect(ipfs).to.exist;
    });
  });
});