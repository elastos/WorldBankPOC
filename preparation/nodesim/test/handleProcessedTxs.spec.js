import {describe, it, before} from 'mocha';
import {handleNewNodeJoinNeedRaTxs} from '../nodes/handleProcessedTxs';
import _ from 'lodash';

import chai, { expect, should } from 'chai';
import chaiAsPromised from "chai-as-promised";
import 'babel-polyfill';
chai.use(chaiAsPromised);
 describe('handleProcessedTxs', ()=>{
   describe('handleNewNodeJoinNeedRaTxs', ()=>{
    
    const block = {
      gasMap: {
        'user #0': 0,
        'user #1': 10,
        'user #2': 90,
        'user #3': 30,
        'user #4': 40,
        'user #5': 50,
        'user #6': 60,
        'user #7': 70,
        'user #8': 60,
        'user #9': 90,
        'user #10': 50,
        'user #11': 50,
        'user #12': 50,
        'user #13': 50,
        'user #14': 50,
        'user #15': 50,
        'user #16': 50,
        'user #17': 50,
        'user #18': 10,
        'user #19': 50
      },
      creditMap: {
        'user #0': 0,
        'user #1': 1,
        'user #2': 10,
        'user #3': 3,
        'user #4': 4,
        'user #5': 5,
        'user #6': 6,
        'user #7': 7,
        'user #8': 8,
        'user #9': 9,
        'user #10': 5,
        'user #11': 5,
        'user #12': 5,
        'user #13': 5,
        'user #14': 5,
        'user #15': 5,
        'user #16': 5,
        'user #17': 5,
        'user #18': 5,
        'user #19': 5
      },
      blockHeight: 33,
      escrowGasMap: {
        bafyreibu6l6wlfr66jfbn5szvfvpblast4cpg2m4ewyfm7cdecpaihk2ui: 20,
        bafyreicbii6ldn45xzdxgvcgwxh6sfva5qaflxbkng7wnzotelzxuaj3z4: 40,
        bafyreieyjiljqy53o4m7vx2fms47iruvatlr3o3fpbcpx2shvstgzx5cdm: 10
      },
      pendingTasks: {
        
      },
      processedTxs: [
        {
          cid: 'bafyreideylggvcikwhhp6qc5fm7bjtjwvj6ibg3ehn4cyweym3cobqtqwm',
          txType: 'newNodeJoinNeedRa'
        }
      ],
      previousBlockCid: undefined,

      totalCreditForOnlineNodes: 24
    
    };
    const userInfo = {
      userName: 'user #2',
      publicKey: '62f6d27c229f3b23f9c502944ba28893b3746b12329af5a162f0a64312cf218d',
      privateKey: '56faba7937792c2e7a683c6cccfa461d291eed0c83f9c0e9f939ad82d8dffef462f6d27c229f3b23f9c502944ba28893b3746b12329af5a162f0a64312cf218d'
    };
    const blockCid= 'bafyreibpujtbz7rllfvaporvk3j57ke4xnjnysn5ftijadcf2gvzzjrcnq';
    const tx= {
      txType: 'newNodeJoinNeedRa',
      userName: 'user #9',
      depositAmt: 10,
      ipfsPeerId: 'Qmf45TTYS7WvhDznjkG6KcDUoBWaqwhSwQ2rdepjgsNrc7'
    };

    const totalCreditForOnlineNodes= 18;

    const txCid= 'bafyreigch6yaj6mwjs34lyjt5whll6hsjvpscpia2yi2h67hamn4j6fwae';

    it('run handleNewNodeJoinNeedRaTxs', ()=>{
      const reqRaObj = handleNewNodeJoinNeedRaTxs({block, blockCid, totalCreditForOnlineNodes, tx, txCid, userInfo});
      console.log('reqRaObj', reqRaObj);
    });


//     // if(handleNewNodeJoinNeedRaTxs({block, blockCid, tx})){

//     // }
  })
})
