import {describe, it, before} from 'mocha';
import {handleNewNodeJoinNeedRaTxs} from '../nodes/handleProcessedTxs';
import _ from 'lodash';

import chai, { expect, should } from 'chai';
import chaiAsPromised from "chai-as-promised";
import 'babel-polyfill';
chai.use(chaiAsPromised);


import {markComputeTaskDoneIfAllRaCompleted} from '../layerOne/taskRoomMessageHandler';

describe.only('markComputeTaskDoneIfAllRaCompleted', ()=>{
  it.skip('It has to have taskOwner, executor, monitors. return undefined if any of them missing', ()=>{
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
      initiatorPeerId: 'Qmcpedsrkpz87cgcbJE3snsugJ7K86zCGZjJyHoihbGfJP',
      lambdaOwnerName: 'user #4',
      lambdaOwnerPeerId: 'QmbKXudJnZTy5dx3ADsSdmd4YaujohpqNpyaHADbnSFngw',
      startBlockHeight: 1,
      followUps: [
        {
          txType: 'computeTaskWinnerApplication',
          ipfsPeerId: 'Qmc3swMSRi7cpr8P9SLyeXkwyULNKKaQvJFyqz1H1ywkGz',
          blockHeightWhenVRF: 1,
          peerId: 'Qmc3swMSRi7cpr8P9SLyeXkwyULNKKaQvJFyqz1H1ywkGz'
        },
        {
          txType: 'computeTaskWinnerApplication',
          ipfsPeerId: 'QmYtDFtJB2BBifKAVoe3ByA632u4n784ywnYmoj4ZUPCgK',
          blockHeightWhenVRF: 1,
          peerId: 'QmYtDFtJB2BBifKAVoe3ByA632u4n784ywnYmoj4ZUPCgK'
        },
        {
          txType: 'computeTaskWinnerApplication',
          ipfsPeerId: 'QmPeXVhC4QDaxPSgY2FqC7ioi8EiWkpWSX6bZudiB9cG3d',
          blockHeightWhenVRF: 1,
          peerId: 'QmPeXVhC4QDaxPSgY2FqC7ioi8EiWkpWSX6bZudiB9cG3d'
        }
      ],
      result: {
        taskOwner: {
          userName: 'user #5',
          executorName: 'user #1',
          result: true,
          peerId: 'Qmcpedsrkpz87cgcbJE3snsugJ7K86zCGZjJyHoihbGfJP'
        },
        executor: {
          userName: 'user #1',
          vrfProof: 'something',
          peerId: 'QmPeXVhC4QDaxPSgY2FqC7ioi8EiWkpWSX6bZudiB9cG3d'
        },
        monitors: {
          QmYtDFtJB2BBifKAVoe3ByA632u4n784ywnYmoj4ZUPCgK: {
            monitorUserName: 'user #3' ,
            executorName: 'user #1',
            vrfProof : 'myVrfProof',
          },
          QmYtDFtJB2BBifKAVoe3ByA632u4n784ywnYmoj4ZUPCgK: {
            peerId: 'QmVmtb69Pumi7G7VGAwRMCcpqrUjiYSYupb2fF6nabpibV',
            raResult: true,
          },
          Qmc3swMSRi7cpr8P9SLyeXkwyULNKKaQvJFyqz1H1ywkGz: {
            monitorUserName: 'user #2' ,
            executorName: 'user #0',
            vrfProof : 'myVrfProof',
            peerId: 'Qmc3swMSRi7cpr8P9SLyeXkwyULNKKaQvJFyqz1H1ywkGz',
            raResult: true,
          }
        }
      }
    };
  

    const ret = markComputeTaskDoneIfAllRaCompleted(computeTaskInPending);
    console.log(ret);
  })
  
});