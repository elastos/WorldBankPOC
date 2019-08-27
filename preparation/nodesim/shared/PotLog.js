const _ = require('lodash');


const key = 'pot_log';
const k1 = 'pot_data';
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
    opts.type = type;
    const app = require('../index');
    const data = app.get(key) || {};
    const d1 = app.get(k1) || {};
    if(!data[C.users]){
      data[C.users] = [];
      d1[C.users] = [];
    }
    if(!data[C.gas]){
      data[C.gas] = [];
      d1[C.gas] = [];
    }
    if(!data[C.ra]){
      data[C.ra] = {};
      d1[C.ra] = {};
    }
    if(!data[C.other]){
      data[C.other] = []
      d1[C.other] = [];
    }

    const ra = data[C.ra];
    const ra1 = d1[C.ra];

    let log = '';
    switch(type){
      case 'user_online':
        log = `${opts.name}[${opts.ipfs_id}] is online`;
        data[C.users].push(log);
        d1[C.users].push({
          name: opts.name,
          status: 'online'
        });
        break;

      case 'user_offline':
        log = `${opts.name}[${opts.ipfs_id}] is offline`;
        data[C.users].push(log);
        d1[C.users].push({
          name: opts.name,
          status: 'offline'
        });
        break;

      case 'gas_transfer':
        log = `
        ${opts.from} transger ${opts.amt} to ${opts.to}.
        ${opts.from} balance is ${opts.from_balance}.
        ${opts.to} balance is ${opts.to_balance}.
        `;
        data[C.gas].push(log);
        d1[C.gas].push(opts);
        break;

      case 'new_ra':
        log = `${opts.name} apply for RA with gas ${opts.amt}, cid is ${opts.cid}`;
        ra[opts.cid] = [];
        ra1[opts.cid] = [];
        ra[opts.cid].push(log);
        ra1[opts.cid].push(opts);
        d1['current'] = opts.cid;
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
        ra1[opts.cid].push(opts);
        break;
      
      case 'req_ra':
        if(opts.vrf && opts.vrf !== 'No'){
          log = `${opts.name} got req remoteAttestation in townHall. vrf is ${opts.vrf}. proofOfVrf is ${JSON.stringify(opts.proofOfVrf)}. proofOfTrust is ${JSON.stringify(opts.proofOfTrust)}`;
        }
        else{
          log = `${opts.name} got req remoteAttestation in townHall. vrf is ${opts.vrf}.`;
        }
        
        ra[opts.cid].push(log);
        ra1[opts.cid].push(opts);
        break;
      
      case 'res_ra':
        log = `${opts.name} broadcast remoteAttestationDone in townHall. potResult is ${opts.potResult}`;
        ra[opts.cid].push(log);
        ra1[opts.cid].push(opts);
        break;
      
      case 'ra_done':
        log = `${opts.name} set remoteAttestationDone in taskRoom. vrfVerifyResult is ${opts.vrf}. `;
        if(!opts.vrf){
          log += `reason is ${opts.reason}`;
        }
        ra[opts.cid].push(log);
        ra1[opts.cid].push(opts);
        break;

      case 'ra_reward':
        log = `${opts.name} get ra reward. gas is ${opts.gas}, credit is ${opts.credit}`;
        ra[opts.cid].push(log);
        ra1[opts.cid].push(opts);

        break;

      case 'ra_penalty':
        log = `${opts.name} get ra penalty. credit is ${opts.credit}`;
        ra[opts.cid].push(log);
        ra1[opts.cid].push(opts);

        break;

      default:
        throw 'invalid type => '+type;
    }
    app.set(key, data);
    app.set(k1, d1);
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

exports.getData = ()=>{
  const app = require('../index');
  return app.get(k1);
}