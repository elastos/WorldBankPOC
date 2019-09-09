import {describe, it, before} from 'mocha';
import {handleNewNodeJoinNeedRaTxs} from '../nodes/handleProcessedTxs';
import _ from 'lodash';

import chai, { expect, should } from 'chai';
import chaiAsPromised from "chai-as-promised";
import 'babel-polyfill';
chai.use(chaiAsPromised);


import {markComputeTaskDoneIfAllRaCompleted} from '../layerOne/taskRoomMessageHandler';

describe.only('markComputeTaskDoneIfAllRaCompleted', ()=>{
  it('It has to have taskOwner, executor, monitors. return undefined if any of them missing', ()=>{
    let computeTaskInPending = {

    };
    let ret = markComputeTaskDoneIfAllRaCompleted(computeTaskInPending);
    expect(ret).to.be.undefined;
    computeTaskInPending = {
      taskOwner:'something'
    };
    ret = markComputeTaskDoneIfAllRaCompleted(computeTaskInPending);
    expect(ret).to.be.undefined;
    computeTaskInPending = {
      taskOwner:'something'
    };
    ret = markComputeTaskDoneIfAllRaCompleted(computeTaskInPending);
    expect(ret).to.be.undefined;
  })
  it('a normal pending task', ()=>{
    const computeTaskInPending = {
      type: 'computeTaskStart',
      initiator: 'user #5',
      initiatorPeerId: 'QmTuQw9NosJid1NTkUKYJdTBHFRriNDaNA5obtazGyHp86',
      lambdaOwnerName: 'user #4',
      lambdaOwnerPeerId: 'QmW39cfRsUJ1rcqQHuGNcm2tQzFgMprFqMqBnGxTKWmJ6c',
      startBlockHeight: 2,
      followUps: [
        {
          txType: 'computeTaskWinnerApplication',
          ipfsPeerId: 'Qma8wRkeXeYtE3RQfqFDGjsKCEqXR5CGxfmRxvus9aULcs',
          blockHeightWhenVRF: 2,
          peerId: 'Qma8wRkeXeYtE3RQfqFDGjsKCEqXR5CGxfmRxvus9aULcs'
        },
        {
          txType: 'computeTaskWinnerApplication',
          ipfsPeerId: 'QmbotokQdnL7DyY8bFV1xdVFPRupxJoWq8zQbLSWXxhJva',
          blockHeightWhenVRF: 2,
          peerId: 'QmbotokQdnL7DyY8bFV1xdVFPRupxJoWq8zQbLSWXxhJva'
        },
        {
          txType: 'computeTaskWinnerApplication',
          ipfsPeerId: 'QmVmtb69Pumi7G7VGAwRMCcpqrUjiYSYupb2fF6nabpibV',
          blockHeightWhenVRF: 2,
          peerId: 'QmVmtb69Pumi7G7VGAwRMCcpqrUjiYSYupb2fF6nabpibV'
        }
      ],
      result: {
        executor: {
          userName: 'user #0',
          vrfProof: [Object],
          peerId: 'QmbotokQdnL7DyY8bFV1xdVFPRupxJoWq8zQbLSWXxhJva'
        },
        monitors: {
          QmVmtb69Pumi7G7VGAwRMCcpqrUjiYSYupb2fF6nabpibV: [Object],
          Qma8wRkeXeYtE3RQfqFDGjsKCEqXR5CGxfmRxvus9aULcs: [Object]
        }
      }
    
    }

    const ret = markComputeTaskDoneIfAllRaCompleted(computeTaskInPending);
    console.log(ret);
  })
  
});