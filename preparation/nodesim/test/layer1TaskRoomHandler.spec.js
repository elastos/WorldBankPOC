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
      initiatorPeerId: 'QmPeaM9PaLP1fK7GbdpmNVUEev59tKxKWubAMC7c6TE2VB',
      lambdaOwnerName: 'user #4',
      lambdaOwnerPeerId: 'QmeFz2NvHF5zh5K5bsPyd3jHjHaiKwnEdSReyXdr8ubpwo',
      startBlockHeight: 2,
      followUps: [
        {
          txType: 'computeTaskWinnerApplication',
          ipfsPeerId: 'QmcbQ9mBHqQtH5Cx3XuEa9KPcKnLVEXECnvCbaTq91uwFj',
          blockHeightWhenVRF: 2,
          peerId: 'QmcbQ9mBHqQtH5Cx3XuEa9KPcKnLVEXECnvCbaTq91uwFj'
        },
        {
          txType: 'computeTaskWinnerApplication',
          ipfsPeerId: 'QmYkBecZGGXrhJ7UrPEUcPaKrPzAarm5R6qpSESteYP9XQ',
          blockHeightWhenVRF: 2,
          peerId: 'QmYkBecZGGXrhJ7UrPEUcPaKrPzAarm5R6qpSESteYP9XQ'
        },
        {
          txType: 'computeTaskWinnerApplication',
          ipfsPeerId: 'QmaWc8cchspWjYDyZCMuNUX7kkR4off5AXXBmRdPbv3Y4E',
          blockHeightWhenVRF: 2,
          peerId: 'QmaWc8cchspWjYDyZCMuNUX7kkR4off5AXXBmRdPbv3Y4E'
        },
        {
          txType: 'computeTaskWinnerApplication',
          ipfsPeerId: 'QmPxPCcr9abX8czivRpCXDhEcLtBkBYkgu5pAzPw7nghuF',
          blockHeightWhenVRF: 2,
          peerId: 'QmPxPCcr9abX8czivRpCXDhEcLtBkBYkgu5pAzPw7nghuF'
        }
      ],
      result: {
        executor: {
          userName: 'user #2',
          vrfProof: undefined,
          peerId: 'QmPeaM9PaLP1fK7GbdpmNVUEev59tKxKWubAMC7c6TE2VB'
        }
      }
    }

    const ret = markComputeTaskDoneIfAllRaCompleted(computeTaskInPending);
    console.log(ret);
  })
  
});