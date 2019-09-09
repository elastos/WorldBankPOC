import {describe, it, before} from 'mocha';
import {handleNewNodeJoinNeedRaTxs} from '../nodes/handleProcessedTxs';
import _ from 'lodash';

import chai, { expect, should } from 'chai';
import chaiAsPromised from "chai-as-promised";
import 'babel-polyfill';
chai.use(chaiAsPromised);


import {markComputeTaskDoneIfAllRaCompleted} from '../layer1taskRoomMessageHandler';

describe('markComputeTaskDoneIfAllRaCompleted', ()=>{
  it('It has to have taskOwner, executor, monitors. return undefined if any of them missing', ()=>{
    let computeTaskInPending = {

    };
    const ret = markComputeTaskDoneIfAllRaCompleted(computeTaskInPending);
    expect(ret).to.be.undefined;
    computeTaskInPending = {
      taskOwner:'something'
    };
    const ret = markComputeTaskDoneIfAllRaCompleted(computeTaskInPending);
    expect(ret).to.be.undefined;
    computeTaskInPending = {
      taskOwner:'something'
    };
    const ret = markComputeTaskDoneIfAllRaCompleted(computeTaskInPending);
    expect(ret).to.be.undefined;
  })
  it('a normal pending task', ()=>{
    const computeTaskInPending = {
      type: 'computeTaskStart',
      initiator: 'user #5',
      initiatorPeerId: 'QmQb2wyRw9ET7VXqSvEfbxsmmg96e82H8dGUDjUpDbxmxv',
      lambdaOwnerName: 'user #4',
      lambdaOwnerPeerId: 'QmSh1yvaZoFA3YoETYrUCrAUrV8TLP9Tz9TMNTWeUHtYGa',
      startBlockHeight: 2,
      followUps: [
        {
          txType: 'computeTaskWinnerApplication',
          ipfsPeerId: 'QmbNUFkGaeigYTcDqcJvn8SkZdUfZu9SnTgsopN1gud281',
          blockHeightWhenVRF: 2,
          peerId: 'QmbNUFkGaeigYTcDqcJvn8SkZdUfZu9SnTgsopN1gud281'
        },
        {
          txType: 'computeTaskWinnerApplication',
          ipfsPeerId: 'QmPsiXzYYrQH93kMBTczuLyVxoVgU8R6mBKchFUaDHw6sM',
          blockHeightWhenVRF: 2,
          peerId: 'QmPsiXzYYrQH93kMBTczuLyVxoVgU8R6mBKchFUaDHw6sM'
        }
      ],
      result: {
        executor: {
          userName: 'user #2',
          vrfProof: [Object],
          peerId: 'QmPsiXzYYrQH93kMBTczuLyVxoVgU8R6mBKchFUaDHw6sM'
        }
      }
    }

    const ret = markComputeTaskDoneIfAllRaCompleted(computeTaskInPending);
    console.log(ret);
  })
  
});