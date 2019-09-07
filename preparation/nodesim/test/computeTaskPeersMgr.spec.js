import ComputeTaskPeersMgr from '../nodes/nodeSimComputeTaskPeersMgr';
import {ComputeTaskRoles} from '../shared/constValue';

import {describe, it, beforeEach} from 'mocha';
import BlockMgr from '../shared/blockMgr';
import {ipfsInit} from '../nodes/ipfsInit';
var assert = require('assert');
import chai, { expect, should } from 'chai';
import chaiAsPromised from "chai-as-promised";
import 'babel-polyfill';
chai.use(chaiAsPromised);

describe('computeTaskPeersMgr', ()=>{
  const localGlobal = {};

  const block1String = `{"gasMap":{"user #0":500,"user #1":500,"user #2":500,"user #3":500,"user #4":500,"user #5":500,
    "user #6":500,"user #7":500,"user #8":500,"user #9":500,"user #10":500,"user #11":1100,"user #12":1200,"user #13":1300
    ,"user #14":1400,"user #15":1500,"user #16":1600,"user #17":1700,"user #18":1800,"user #19":1900},"creditMap":{"user #0"
    :26,"user #1":26,"user #2":26,"user #3":26,"user #4":26,"user #5":26,"user #6":26,"user #7":26,"user #8":26,"user #9":26,
    "user #10":26,"user #11":58,"user #12":63,"user #13":68,"user #14":74,"user #15":79,"user #16":84,"user #17":89,"user #18"
    :95,"user #19":100},"processedTxs":[],"blockHeight":0,"totalCreditForOnlineNodes":0,"escrowGasMap":{},"pendingTasks":{}}`;
  
  const block2String = `{"gasMap":{"user #0":500,"user #1":500,"user #2":500,"user #3":500,"user #4":500,"user #5":500,"user 
  #6":500,"user #7":500,"user #8":500,"user #9":500,"user #10":500,"user #11":1100,"user #12":1200,"user #13":1300,"user #14":
  1400,"user #15":1500,"user #16":1600,"user #17":1700,"user #18":1800,"user #19":1900},"creditMap":{"user #0":26,"user #1":26,
  "user #2":26,"user #3":26,"user #4":26,"user #5":26,"user #6":26,"user #7":26,"user #8":26,"user #9":26,"user #10":26,"user 
  #11":58,"user #12":63,"user #13":68,"user #14":74,"user #15":79,"user #16":84,"user #17":89,"user #18":95,"user #19":100},
  "processedTxs":[{"txType":"uploadLambda","cid":"bafyreib3c4rnd4hfpkgniqqdrgf2alglkdjk5vpankeueipmaku6v6l56y"}],"blockHeight":2,
  "totalCreditForOnlineNodes":156,"escrowGasMap":{},"pendingTasks":{}}`

  const block3String = `{"gasMap":{"user #0":500,"user #1":500,"user #2":500,"user #3":500,"user #4":500,"user #5":497,
  "user #6":500,"user #7":500,"user #8":500,"user #9":500,"user #10":500,"user #11":1100,"user #12":1200,"user #13"
  :1300,"user #14":1400,"user #15":1500,"user #16":1600,"user #17":1700,"user #18":1800,"user #19":1900},"creditMap"
  :{"user #0":26,"user #1":26,"user #2":26,"user #3":26,"user #4":26,"user #5":26,"user #6":26,"user #7":26,"user #8"
  :26,"user #9":26,"user #10":26,"user #11":58,"user #12":63,"user #13":68,"user #14":74,"user #15":79,"user #16":84,"
  user #17":89,"user #18":95,"user #19":100},"processedTxs":[{"txType":"uploadLambda",
  "cid":"bafyreib3c4rnd4hfpkgniqqdrgf2alglkdjk5vpankeueipmaku6v6l56y"},{"txType":"computeTask",
  "cid":"bafyreic6bghpwow4lmjsvcy5pi5grqpwol62ousmsx475pyuzxpqqbdsde"}],"blockHeight":1,
  "totalCreditForOnlineNodes":156,"escrowGasMap":{"bafyreic6bghpwow4lmjsvcy5pi5grqpwol62ousmsx475pyuzxpqqbdsde":3},
  "pendingTasks":{"bafyreic6bghpwow4lmjsvcy5pi5grqpwol62ousmsx475pyuzxpqqbdsde":{"type":"computeTask",
  "initiator":"user #5","initiatorPeerId":"QmZJuoW98KjdpxWpPZTtMUaGQdoRJ3rmgCdAhEsipZky3Y","lambdaOwnerName":
  "user #4","lambdaOwnerPeerId":"QmdQikeZSqiTN4AZJ3EMRPkDSRXf6313kTPk7mkSv6j77C","startBlockHeight":1,"followUps":[]}}}`;
  const block4String = `{"gasMap":{"user #0":500,"user #1":500,"user #2":497,"user #3":497,"user #4":500,"user #5":494,
  "user #6":500,"user #7":500,"user #8":500,"user #9":500,"user #10":500,"user #11":1100,"user #12":1200,"user #13":
  1300,"user #14":1400,"user #15":1500,"user #16":1600,"user #17":1700,"user #18":1800,"user #19":1900},"creditMap"
  :{"user #0":26,"user #1":26,"user #2":26,"user #3":26,"user #4":26,"user #5":26,"user #6":26,"user #7":26,"user #8"
  :26,"user #9":26,"user #10":26,"user #11":58,"user #12":63,"user #13":68,"user #14":74,"user #15":79,"user #16":84
  ,"user #17":89,"user #18":95,"user #19":100},"processedTxs":[{"txType":"computeTaskWinnerApplication","ipfsPeerId":
  "QmX4bx61jqPfiJx9NkHosgwNxVQKKhFsU6pRwQUyx2LQyj","userName":"user #2",
  "taskCid":"bafyreic6bghpwow4lmjsvcy5pi5grqpwol62ousmsx475pyuzxpqqbdsde","blockHeightWhenVRF":3},
  {"txType":"computeTaskWinnerApplication","ipfsPeerId":"QmbRvPbBo14zydGybie3QpZaM3QnrC36wGAHAfAaAJJJHu"
  ,"userName":"user #5","taskCid":"bafyreic6bghpwow4lmjsvcy5pi5grqpwol62ousmsx475pyuzxpqqbdsde","blockHeightWhenVRF":3}
  ,{"txType":"computeTaskWinnerApplication","ipfsPeerId":"QmeWtzB3GinhFiUmZksQ7zq1ENDdQQtRk97mTji5peht1E","userName":
  "user #3","taskCid":"bafyreic6bghpwow4lmjsvcy5pi5grqpwol62ousmsx475pyuzxpqqbdsde","blockHeightWhenVRF":3}],
  "blockHeight":4,"totalCreditForOnlineNodes":156,"escrowGasMap":{"bafyreic6bghpwow4lmjsvcy5pi5grqpwol62ousmsx475pyuzxpqqbdsde"
  :12},"pendingTasks":{"bafyreic6bghpwow4lmjsvcy5pi5grqpwol62ousmsx475pyuzxpqqbdsde":{"type":"computeTask","initiator":
  "user #5","initiatorPeerId":"QmbRvPbBo14zydGybie3QpZaM3QnrC36wGAHAfAaAJJJHu","lambdaOwnerName":"user #4",
  "lambdaOwnerPeerId":"QmbN64AYjzZhQLySmRULjvQ4vmq48Rpfo8tAM8BV5rbEQG","startBlockHeight":3,"followUps":
  [{"txType":"computeTaskWinnerApplication","ipfsPeerId":"QmX4bx61jqPfiJx9NkHosgwNxVQKKhFsU6pRwQUyx2LQyj",
  "blockHeightWhenVRF":3,"peerId":"QmX4bx61jqPfiJx9NkHosgwNxVQKKhFsU6pRwQUyx2LQyj"},{"txType":
  "computeTaskWinnerApplication","ipfsPeerId":"QmbRvPbBo14zydGybie3QpZaM3QnrC36wGAHAfAaAJJJHu","blockHeightWhenVRF":3,
  "peerId":"QmbRvPbBo14zydGybie3QpZaM3QnrC36wGAHAfAaAJJJHu"},{"txType":"computeTaskWinnerApplication",
  "ipfsPeerId":"QmeWtzB3GinhFiUmZksQ7zq1ENDdQQtRk97mTji5peht1E","blockHeightWhenVRF":3,"peerId":
  "QmeWtzB3GinhFiUmZksQ7zq1ENDdQQtRk97mTji5peht1E"}]}}}`;

  const user5Info = {
    userName: 'user #5',
    publicKey: '506c192b2c2f471b7789a36bb651a5e51233b7041e15b6ec8fc130ade40a35f0',
    privateKey: '8efd349230f9b35e55d8ab1e1263aa043185ad69ec84d7d3a438478c5ea4312e506c192b2c2f471b7789a36bb651a5e51233b7041e15b6ec8fc130ade40a35f0',
    peerId: 'Qmd97ttzP58jXmPtCdRdaeg7bXH7bCtKBaur8ZMgu7dXxb'
  };

  const user4Info={
    userName: 'user #4',
    publicKey: 'e6ceb047e97120cfebd783ee0d031692725cf4167a732fba07a463141e3df0c9',
    privateKey: 'df6112881221848d1fd6b30cceb1d53bb1cf514b743f15fd69ca8de8d8a8ffa6e6ceb047e97120cfebd783ee0d031692725cf4167a732fba07a463141e3df0c9',
    peerId: 'QmPidxU6zWk62uqrZWQpajNQxuMPNqWoH6bjGpCZmiZTWz'
  };

  const user3Info={
    userName: 'user #3',
    publicKey: 'a0a0adf4facb48cc75e60e718b37deff7281495e9956375ad6b0aafe9ca605a8',
    privateKey: '3e2cd2a2e048df68b92304ea53e669c637ff4a911ef1553801f6407b051b5345a0a0adf4facb48cc75e60e718b37deff7281495e9956375ad6b0aafe9ca605a8',
    peerId: 'QmVxfGtbh95P1yiNVL9TmEm1tZm7SjcFbLo6UbG6SEfHJc'
  }

  const user2Info={
    userName: 'user #2',
    publicKey: '778e89b4d693ea0dfd4a81d2ab692005990e15475754d9a13a4519d16a421299',
    privateKey: 'af78dc06a0a84816b4f739a2beb900d06c080c1b1604754715d2e44f999790c7778e89b4d693ea0dfd4a81d2ab692005990e15475754d9a13a4519d16a421299',
    peerId: 'QmPmrqh4ybdUJwGchEecuj2GBXCxKL5iapW9qmk8pwgCGs'
  };

  const user1Info={
    userName: 'user #1',
    publicKey: '17d8793a96707a6d38531a0efa7db9f2d3958acc078fbe8b8de257069402d9fc',
    privateKey: '5015252814d7fd6e3f1e7b181bb88417b432da229245e3ad57feb7cdcb7464e817d8793a96707a6d38531a0efa7db9f2d3958acc078fbe8b8de257069402d9fc',
    peerId: 'QmXk4ADrW2e2ShXL1UoxdGjjSWbaC3RxWe1EqpQd7Eftqu'
  };

  const user0Info={
    userName: 'user #0',
    publicKey: 'd98ab6571fd9b30918a22c67c8eabb243ac0d2109b9de035c9935e5a097f5fcf',
    privateKey: '099530b2f524e02fab9eaa9f00d3ba11165a3630987c8252807bf0078306f522d98ab6571fd9b30918a22c67c8eabb243ac0d2109b9de035c9935e5a097f5fcf',
    peerId: 'QmZEYeEin6wEB7WNyiT7stYTmbYFGy7BzM7T3hRDzRxTvY'
  };


  beforeEach(async()=>{
    localGlobal.ipfs = localGlobal.ipfs? localGlobal.ipfs : await ipfsInit( 'local');
    localGlobal.instance = new ComputeTaskPeersMgr(localGlobal.ipfs)
    const lambda = {
      "txType": "uploadLambda",
      "lambdaName": "hello_world",
      "dockerImg": "placeholder",
      "payment": "payPerUse",
      "ownerName": "user #4",
      "amt": 2
    };

    const lambdaCid = (await localGlobal.ipfs.dag.put(lambda)).toBaseEncodedString();
    const task = {
      "txType": "computeTask",
      "userName": "user #5",
      "lambdaCid": lambdaCid,
      "postSecData": "placeholder",
      "env": {
        "network": "totalIsolated",
        "ipAllowed": "none",
        "p2pTrafficInAllowed": "owner",
        "resultSendBackTo": "owner",
        "errorSendBackTo": "owner",
        "osRequirement": "none",
        "timeOut": "100",
        "cleanUpAfter": "totalWipeout"
      },
      "executorRequirement": {
        "credit": 3,
        "deposit": 10
      },
      "multiParties": "none",
      "depositAmt": 3
    };
    localGlobal.taskCid = (await localGlobal.ipfs.dag.put(task)).toBaseEncodedString();
    return localGlobal;
  });

  it('addNewComputeTask, set User #4 the lambda owner', async ()=>{
    localGlobal.instance.addNewComputeTask(localGlobal.taskCid);
    //localGlobal.instance.debugOutput(localGlobal.taskCid);
    expect(localGlobal.instance.checkMyRoleInTask(localGlobal.taskCid)).to.be.undefined;
    const assignedRole = await localGlobal.instance.assignSpecialRoleToTask(localGlobal.taskCid, "user #4");
    expect(assignedRole).to.equal(ComputeTaskRoles.lambdaOwner);
    expect(localGlobal.instance.checkMyRoleInTask(localGlobal.taskCid)).to.equal(ComputeTaskRoles.lambdaOwner);
  });

  it('addNewComputeTask, set User #5 the task owner', async ()=>{
    localGlobal.instance.addNewComputeTask(localGlobal.taskCid);
    expect(localGlobal.instance.checkMyRoleInTask(localGlobal.taskCid)).to.be.undefined;
    const assignedRole = await localGlobal.instance.assignSpecialRoleToTask(localGlobal.taskCid, "user #5");
    localGlobal.instance.debugOutput(localGlobal.taskCid);
    expect(assignedRole).to.equal(ComputeTaskRoles.taskOwner);
    expect(localGlobal.instance.checkMyRoleInTask(localGlobal.taskCid)).to.equal(ComputeTaskRoles.taskOwner);
  });


})
