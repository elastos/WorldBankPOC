import {describe, it, before} from 'mocha';
import {handleNewNodeJoinNeedRaTxs} from '../nodes/handleProcessedTxs';
import _ from 'lodash';

import chai, { expect, should } from 'chai';
import chaiAsPromised from "chai-as-promised";
import 'babel-polyfill';
chai.use(chaiAsPromised);

import {settleComputeTaskTestable} from '../layerOne/generateBlock';

describe.skip('settle compute task', ()=>{
  it('it should run', ()=>{
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
        blockHeightWhenExecutionCompleted: 4,
        taskOwner: {
          userName: 'user #5',
          executorName: 'user #1',
          result: true,
          peerId: 'Qmcpedsrkpz87cgcbJE3snsugJ7K86zCGZjJyHoihbGfJP'
        },
        executor: {
          userName: 'user #0',
          vrfProof: 'something',
          peerId: 'QmPeXVhC4QDaxPSgY2FqC7ioi8EiWkpWSX6bZudiB9cG3d',
          
        },
        monitors: {
          Qmc3swMSRi7cpr8P9SLyeXkwyULNKKaQvJFyqz1H1ywkGz: {
            monitorUserName: 'user #1' ,
            executorName: 'user #0',
            vrfProof : 'myVrfProof',
            peerId: 'Qmc3swMSRi7cpr8P9SLyeXkwyULNKKaQvJFyqz1H1ywkGz',
            raResult: true,
          },
          QmYtDFtJB2BBifKAVoe3ByA632u4n784ywnYmoj4ZUPCgK: {
            monitorUserName: 'user #2' ,
            executorName: 'user #0',
            vrfProof : 'myVrfProof',
            peerId: 'QmYtDFtJB2BBifKAVoe3ByA632u4n784ywnYmoj4ZUPCgK',
            raResult: true,
          }
        }
      }
    };
    const gasMap = {
      'user #1': 500,
      'user #2': 500,
      'user #3': 500,
      'user #4': 500,
      'user #5': 500
    };

    const creditMap = {
      'user #1': 100,
      'user #2': 100,
      'user #3': 100,
      'user #4': 100,
      'user #5': 100
    };

    const escrowTotal = 12;
    const lambdaOwnerGas = 2;
    const ret = settleComputeTaskTestable(computeTaskInPending, gasMap, creditMap,  escrowTotal, lambdaOwnerGas)
  })


})