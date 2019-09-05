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

describe.only('computeTaskPeersMgr', ()=>{
  const localGlobal = {};
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
