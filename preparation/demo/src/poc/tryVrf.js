const {utils, ecvrf, sortition} = require('vrf.js');


exports.tryVrf = (req, res)=>{
  const X = Buffer.from('test')
 
  const [publicKey, privateKey] = utils.generatePair()
  //console.log('publickey, privatekey', publicKey.value.toString('hex'), privateKey.value.toString('hex'));
  console.log('publickey, privatekey', publicKey.toString('hex'), privateKey.toString('hex'));

  const {value, proof} = ecvrf.vrf(publicKey, privateKey, X)
  console.log('value, proof', value.toString('hex'), proof.toString('hex'));
  const result = ecvrf.verify(publicKey, X, proof, value);
  console.log('result,', result);
  res.send("cool");
}