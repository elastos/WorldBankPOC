/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
const request = require('supertest');
const httpStatus = require('http-status');
const { expect, should, assert } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const { some, omitBy, isNil } = require('lodash');

import runVrf from '../poc/layerOneBlock/taskRoomMessageHandler';
import {testVrfSortition} from '../poc/tryVrf';
import { doesNotThrow } from 'assert';
import {runCreditNormalization} from '../poc/layerOneBlock/generateBlock';

describe('test VRF', async () => {
  beforeEach(()=> {
    // ...some logic before each test is run
    
  });
  it.skip('Try VRF function and Sortition Result', ()=>{
    
    const output = testVrfSortition(7);
    console.log(output);
    expect(output.length).to.greaterThan(1);

    
  });
});

describe('CreditNormalization', ()=>{
  it('input a creditMap, lets normalize', ()=>{
    const creditMapInput = {
      user0:100,
      user1:500,
      user3:150
    };
    const maxCredit = 300;
    const totalCredit = (mapCredit)=>{
      return Object.values(mapCredit).reduce((accu, c)=>{
      return accu + c;
    }, 0)};
    
    const inputTotal = totalCredit(creditMapInput);
    const outputCreditMap = runCreditNormalization(creditMapInput, maxCredit);
    const outputTotal = totalCredit(outputCreditMap);
    console.log("before&after:" , creditMapInput , outputCreditMap);
    expect(maxCredit).to.equal(outputTotal);
  })
})