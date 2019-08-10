const potSchema = require('./potSchema');
const creditSchema = require('./creditSchema');
const gasSim = require('./gasSim');
const sha256 = require('js-sha256');

class ProofOfTrust {
  constructor({
    peerId, pcrReading, otherEvidence, hacked, depositGasTxId
  }) {
    
    this.peerId = peerId;
    this.pcrReading = pcrReading || 'placeholder';
    this.otherEvidence = otherEvidence || 'placeholder';
    this.hacked = hacked || false;
    this.depositGasTxId = depositGasTxId;
    // Error.captureStackTrace(this, this.constructor.name);
  }
}

exports.getRealProofOfTrust = ()=>{
  //
  console.log('please put real code to receive PCR and other PoT information from TPM here');
  const peerId = '0';
  const hacked = false;
  return new ProofOfTrust({peerId, hacked});
};

const createPlaceHolderPot = exports.createPlaceHolderPot = ({peerId, hacked, depositGasTxId}) => {
  console.log("line17, peerid and hacked,", peerId, hacked, depositGasTxId);
  return new ProofOfTrust({peerId, hacked, depositGasTxId});
};

exports.verifyPot = (pot, bForcePass) =>{
  console.log('Verifying pot:', pot);
  console.log('POC want it pass or fail. This is just a place holder, you need to add real logic later. Value:', bForcePass);
  if(bForcePass) return true;
  if(pot.hacked) return false;
  return true;
};

exports.getPotFromHash = async (potHash) => {
  return await potSchema.get(potHash);
};

exports.createGenesisPot = async ()=>{
  const reducer = async (accum, pot)=>{
    accum = await accum;
    
    //create tx log
    await gasSim.set(pot.peerId, '500');
    const txObj = await gasSim.transferGasToEscrow(pot.peerId, 10, "NewNodeJoinDepositGas_ref_peerId", pot.peerId);

    //create pot
    const potObj = createPlaceHolderPot({
      peerId: pot.peerId,
      hacked: false, 
      depositGasTxId: txObj._id
    });
    const potHash = sha256(JSON.stringify(potObj));
    potObj.potHash = potHash;
    potObj.location = pot.location;
    await potSchema.newPot(potObj);

    // await gasSim.set(pot.peerId, '500');
    await creditSchema.set(pot.peerId, '500');
    
    
    return accum;
  };

  const count = await potSchema.count().exec();
  if(count > 0){
    throw 'There are some pots already. could not generate genesis pots';
  }

  const pots = [
    {
      peerId : 'genesis_1',
      location : [-122, 47]
    },
    {
      peerId : 'genesis_2',
      location : [-46, -23]
    },
    {
      peerId : 'genesis_3',
      location : [103, 1]
    },
    {
      peerId : 'genesis_4',
      location : [121, 31]
    },
    {
      peerId : 'genesis_5',
      location : [-122.26, 37.46]
    }
  ];

  await pots.reduce(reducer, Promise.resolve(''));

  return true;
};