const _ = require('lodash');


const key = 'pot_log';
const C = {
  users : 'users',
  gas : 'gas_transfer',
  ra : 'remote_attestation',
  other : 'others'
};
const q = [];

const F = {
  fire(){
    if(q.length < 1) return false;

    const arg = q.shift();
    F.process(arg[0], arg[1]);

    F.fire();
  },

  process(type, opts){
    const app = require('../index');
    const data = app.get(key) || {};
    if(!data[C.users]){
      data[C.users] = [];
    }
    if(!data[C.gas]){
      data[C.gas] = [];
    }
    if(!data[C.ra]){
      data[C.ra] = {};
    }
    if(!data[C.other]){
      data[C.other] = []
    }

    const ra = data[C.ra];

    let log = '';
    switch(type){
      case 'user_online':
        log = `${opts.name}[${opts.ipfs_id}] is online`;
        data[C.users].push(log);
        break;

      case 'user_offline':
        log = `${opts.name}[${opts.ipfs_id}] is offline`;
        data[C.users].push(log);
        break;

      case 'gas_transfer':
        log = `
        ${opts.from} transger ${opts.amt} to ${opts.to}.
        ${opts.from} balance is ${opts.from_balance}
        ${opts.to} balance is ${opts.to_balance}
        `;
        data[C.gas].push(log);
        break;

      case 'new_ra':
        log = `${opts.name} apply for RA with gas ${opts.amt}, cid is ${opts.cid}`;
        ra[opts.cid] = [];
        ra[opts.cid].push(log);
        break;
      
      case 'req_ra_send':
        log = `${opts.name} send reqRemoteAttestation in townHall. j is ${opts.j}. `;
        if(opts.j > 0){
          log += `Lucky, proof is ${opts.proof}. blockCid is ${opts.blockCid}`;
        }
        else{
          log += 'Bad Lucky, try next time.';
        }
        ra[opts.cid].push(log);
        break;
      
      case 'req_ra':
        log = `${opts.name} send resRemoteAttestation in townHall. vrf is ${opts.vrf}. proofOfVrf is ${JSON.stringify(opts.proofOfVrf)}. proofOfTrust is ${JSON.stringify(opts.proofOfTrust)}`;
        ra[opts.cid].push(log);
        break;
      
      case 'res_ra':
        log = `${opts.name} broadcase remoteAttestationDone in townHall. potResult is ${opts.potResult}`;
        ra[opts.cid].push(log);
        break;
      
      case 'ra_done':
        log = `${opts.name} set remoteAttestationDone in taskRoom. vrfVerifyResult is ${opts.vrf}. `;
        if(!opts.vrf){
          log += `reason is ${opts.reason}`;
        }
        ra[opts.cid].push(log);
        break;

      default:
        throw 'invalid type => '+type;
    }
    app.set(key, data);
  }
};


exports.log = (type, opts)=>{
  const arg = [type, opts];
  q.push(arg);
  F.fire();
}

exports.get = ()=>{
  const app = require('../index');
  return app.get(key);
}