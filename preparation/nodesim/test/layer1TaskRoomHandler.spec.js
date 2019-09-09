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
    let computeTaskInPending = {
      taskOwner:'something'
    };
    const ret = markComputeTaskDoneIfAllRaCompleted(computeTaskInPending);
    expect(ret).to.be.undefined;
    let computeTaskInPending = {
      taskOwner:'something'
    };
    const ret = markComputeTaskDoneIfAllRaCompleted(computeTaskInPending);
    expect(ret).to.be.undefined;
  })
  

});