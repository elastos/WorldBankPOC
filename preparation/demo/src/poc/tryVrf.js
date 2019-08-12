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


  const times = parseInt(req.query.times || '10');
  const w = new Big(parseInt(req.query.w || '10'));  // 持币量
  const W = new Big(parseInt(req.query.W || '1000'));  // 总币量
  const tau = new Big(parseInt(req.query.tau || '10'));

  const getAverangeResult = (f, times) =>{
    let sum = 0;
    for (let i = 0; i < times; i++) {
      sum += f();
    }
    return (sum / times).toFixed(2);
  };
  
  console.log('C(5,0)', sortition.combination(new Big(5), new Big(0)).toString());
  
  // 希望多少人被选出来
  for (let a = 1; a <= times; a++) {
    const p = a / W;
  
    const c = getAverangeResult(() => {
      let count = 0;
      for (let i = 0; i < 10; i++) {
  
        const [pub, pri] = utils.generatePair();
  
        const { proof, value } = ecvrf.vrf(pub, pri, utils.B([12]));
  
        const j = sortition.getVotes(value, new Big(w), new Big(p));
        j.gt(0) && count++;
  
        // easierCheckVote(vrf, new Big(w), new Big(p)) && count++
      }
      return count;
    }, 10);
  
    console.log('   count: ', a, '\t->', c);
  }
  

  
  res.send("vrf test");
}