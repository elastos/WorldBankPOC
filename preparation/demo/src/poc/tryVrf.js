const {utils, ecvrf, sortition} = require('vrf.js');
const Big = require('big.js');

const logger = name => (...args) => {
  console.log(`[${name}]\t`, ...args)
}
const log = logger('Sortition');
exports.tryVrf = (req, res)=>{
  // const X = Buffer.from('test')
 
  // const [publicKey, privateKey] = utils.generatePair()
  // //console.log('publickey, privatekey', publicKey.value.toString('hex'), privateKey.value.toString('hex'));
  // console.log('publickey, privatekey', publicKey.toString('hex'), privateKey.toString('hex'));

  // const {value, proof} = ecvrf.vrf(publicKey, privateKey, X)
  // console.log('value, proof', value.toString('hex'), proof.toString('hex'));
  // const result = ecvrf.verify(publicKey, X, proof, value);
  // console.log('result,', result);


  const times = parseInt(req.query.times || '5');
  const w = new Big(parseInt(req.query.w || '10'));
  const W = new Big(parseInt(req.query.W || '1000'));
  const tau = new Big(parseInt(req.query.tau || '10'));

  
  const seed = Buffer.from('previousBlockHashUnpredictable')
  const role = Buffer.from('luckyDraw')

  let success = 0;
  let fail = 0;
  for (let i = 0; i < times; i++) {
    const [publicKey, privateKey] = utils.generatePair()
    const [value, proof, j] = sortition.sortition(privateKey, publicKey, seed, tau, role, w, W)
    log(`-------------- test ${i} --------------`)
    log(' value:', value.toString('hex'))
    log('     j:', j.toString())
    log('result:', j.gt(0))
    const result = j.gt(0);
    success += result? 1:0;
    
    fail += result? 0: 1;
  }
  log("Success:", success);
  log("Fail", fail);

  
  res.send("vrf test");
}