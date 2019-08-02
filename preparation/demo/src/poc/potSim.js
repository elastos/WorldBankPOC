

class ProofOfTrust {
  constructor({
    peerId, pcrReading, otherEvidence, hacked
  }) {
    
    this.peerId = peerId;
    this.pcrReading = pcrReading || 'placeholder';
    this.otherEvidence = otherEvidence || 'placeholder';
    this.hacked = hacked || false;
    // Error.captureStackTrace(this, this.constructor.name);
  }
}

exports.sampleGoodPot = () => {
  const peerId = '0';
  const hacked = false;
  return new ProofOfTrust({peerId, hacked});
};

exports.sampleBadPot = () => {
  const peerId = '9999'
  const hacked = true;
  return new ProofOfTrust({peerId, hacked});
};

exports.createPlaceHolderPot = ({peerId, hacked}) => {
  console.log("line17, peerid and hacked,", peerId, hacked);
  return new ProofOfTrust({peerId, hacked});
};

exports.verifyPot = (pot, bForcePass) =>{
  console.log('Verifiying pot:', pot);
  console.log('POC want it pass or fail. This is just a place holder, you need to add real logic later. Value:', bForcePass);
  if(bForcePass) return true;
  if(pot.hacked) return false;
  return true;
};


