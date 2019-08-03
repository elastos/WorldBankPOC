const vrfSim = require('./vrfSim');
const potSim = require( './potSim');
const ethSim = require( './ethSim');
const constValue = require( './constValue');

const weightedThreshold = (creditScore) => {
  const weight = creditScore / constValue.totalCreditToken;
  return weight * constValue.thresholdForVrfRa;
};

const signature = (peerId, privKey, input) =>{

}


const getPotFromHash = (raTaskHash) =>{
  console.log("placeholder, just return a good pot without actually retrieve")
  return potSim.sampleGoodPot();
}


exports.verifyOthersRa = () => {

};

exports.notifyNewJoinNodeNeedRa = ({newJoinTxHash, peerId, privKey, creditScore}) => {
  const inputHash = newJoinTxHash;
  const {pi, outputHash} = vrfSim.createVrf({peerId, privKey, inputHash});
  const threshold = weightedThreshold(creditScore);
  if(outputHash < threshold){
    console.log("I am lucky, I have the chance to run RA, ", outputHash, threshold);
    console.log('placeholder, doing RemoteAttestation ....');
    const pot = getPotFromHash(newJoinTxHash);
    const raResult = potSim.verifyPot(pot, false);
    ethSim.signRaTask('sigPlaceHolder', newJoinTxHash, pi, raResult);


  }else{
    console.log('not lucky enough to run RA');
  }
};