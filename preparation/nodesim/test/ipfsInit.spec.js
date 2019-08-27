import chai, { expect, should } from 'chai';
should();
import chaiAsPromised from "chai-as-promised";
import 'babel-polyfill';
chai.use(chaiAsPromised);

import ipfsInit from '../nodes/ipfsInit';

describe.skip('IPFS', ()=>{
  describe('ipfs init', ()=>{
    it('ipfs init with option default to local',async ()=>{
      const ipfs = await ipfsInit('local');
      expect(ipfs).to.exist;
    });
  });
});