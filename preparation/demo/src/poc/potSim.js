const potSchema = require('./potSchema');

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

exports.createPlaceHolderPot = ({peerId, hacked, depositGasTxId}) => {
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
