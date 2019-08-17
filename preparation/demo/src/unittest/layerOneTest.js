/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
const request = require('supertest');
const httpStatus = require('http-status');
const { expect, should, assert } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const { some, omitBy, isNil } = require('lodash');

const runVrf = require('../poc/layerOneBlock/taskRoomMessageHandler');

describe('test VRF', async () => {
  beforeEach(()=> {
    // ...some logic before each test is run
    
  });

  it('should world', ()=>{
    const testObj = {
      potResult: false,
      proofOfVrf: {
        j: 1,
        type: 'reqRemoteAttestation',
        proof: '023df90c2e26e67efe75502879d9449e17b22143889c219d0553d73a6bc8cab053f6bd618cb456f4e2ef50e65750d331c03d26d652bc736b1a0d18d5f90e3293406e02f5d1b5c39e50527c3f901bde0777',
        value: '3df90c2e26e67efe75502879d9449e17b22143889c219d0553d73a6bc8cab053',
        taskCid: 'bafyreiehyybnsbcm53qrfepeung3t2klfeao7ucxniiggtiyt6abb67bz4',
        blockCid: 'bafyreihqhwi6ad4h67d4cmsqtc6lc2rzvmwheag767qyzxuyy575s2iwm4',
        publicKey: 'f90ccb7d7be6012c8351aab4f7c753db89e8513f3c69edaca9f4b1097b7a4655'
      },
      proofOfTrust: {
        psrData: 'placeholder',
        isHacked: true,
        tpmPublicKey: 'placeholder'
      }
    };
    expect(runVrf(testObj)).to.equal(true);
  })
  // let adminAccessToken;
  // let userAccessToken;
  // let dbUsers;
  // let user;
  // let admin;

  // const password = '123456';
  // const passwordHashed = await bcrypt.hash(password, 1);

  // beforeEach(async () => {
  //   dbUsers = {
  //     branStark: {
  //       email: 'branstark@gmail.com',
  //       password: passwordHashed,
  //       name: 'Bran Stark',
  //       role: 'admin',
  //     },
  //     jonSnow: {
  //       email: 'jonsnow@gmail.com',
  //       password: passwordHashed,
  //       name: 'Jon Snow',
  //     },
  //   };

  //   user = {
  //     email: 'sousa.dfs@gmail.com',
  //     password,
  //     name: 'Daniel Sousa',
  //   };

  //   admin = {
  //     email: 'sousa.dfs@gmail.com',
  //     password,
  //     name: 'Daniel Sousa',
  //     role: 'admin',
  //   };

  //   await User.remove({});
  //   await User.insertMany([dbUsers.branStark, dbUsers.jonSnow]);
  //   dbUsers.branStark.password = password;
  //   dbUsers.jonSnow.password = password;
  //   adminAccessToken = (await User.findAndGenerateToken(dbUsers.branStark)).accessToken;
  //   userAccessToken = (await User.findAndGenerateToken(dbUsers.jonSnow)).accessToken;
  // });


});
