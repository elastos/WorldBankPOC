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
import { resolve } from 'dns';

describe('test VRF', async () => {
  beforeEach(()=> {
    // ...some logic before each test is run
    
  });
  it('Try VRF function and Sortition Result', ()=>{
    
    const output = testVrfSortition(7);
    console.log(output);
    expect(output.length).to.greaterThan(1);

    
  });
});
