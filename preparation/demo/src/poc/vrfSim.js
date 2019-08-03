exports.createVrf = ({peerId, privKey, inputHash}) => {
  const outputHash = Math.random();//'placeHolderForOutputHash' of course, this is not a vrf, just a regular random for test purpose
  const pi = 'placeHolderForPi';
  return {peerId, pi, outputHash};
};

exports.verifyVrf = ({peerId, pi, inputHash}) => {
  return 0;//this value is supposed to be the createVrf function original output. Use the 0 as a placeholder
};
