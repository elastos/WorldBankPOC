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


  const total = parseInt(req.query.total || '10'); //how many users will be in this comittee competition
  const getAverangeResult = (f, total) =>{
    let sum = 0;
    for (let i = 0; i < total; i++) {
      sum += f();
    }
    return (sum / total).toFixed(0); //we do the voting <total> times, and get the average number of <c> 
  };

  const msg = 'This string has nothing to do with the result, just a preset value which is out of anyones control. it can be verified by others';
  //We would like to select <a> comittee members from total <total> users into the committee

  //Generate <total> users own different amount of coins. this difference of owners will refect to the win rate and voting power (after elected into committee)
  const users = [];
  let totalCoins = 0;
  for (var i = 0; i < total; i ++){
    const user = {};
    user.owns = 10*i;
    user.name = "user #" + i;
    const [pub, pri] = utils.generatePair();
    user.pub = pub;
    user.pri = pri;
    user.j = []
    users.push(user);
    
    totalCoins += user.owns;
  }

  // console.log(JSON.stringify(users.map((u)=>{
  //   return {name:u.name, pub:u.pub.toString('hex'), pri:u.pri.toString('hex')};
  // })));


  const W = totalCoins;

  for (let a = 1; a <= users.length; a++) {//Now we are going to elect <a> users into the comittee from total of <users.length> users. We start from one , then up to the total numbers (every one can be elected)
    console.log('Now, let vote for ', a , ' delegates from ', users.length, ' users');
    const p = a / W;
  
    const c = getAverangeResult(() => {
      let count = 0;
      for (let i = 0; i < users.length; i++) {//lets loop each user in users. 
        const user = users[i];
        const pub = user.pub;
        const pri = user.pri;
        const w = user.owns;
        const { proof, value } = ecvrf.vrf(pub, pri, utils.B(msg));
  
        const j = sortition.getVotes(value, new Big(w), new Big(p));
        user.j.push(j.toFixed(0));//we can record the j for each vote.
        j.gt(0) && count++;//if j < 0, this user is not elected, if j > 0, this user is elected into the committee. j is also the weight during voting
        const result = ecvrf.verify(pub, utils.B(msg), proof, value);
        if(! result){
          console.log("!!!!!! ", user.name, "is cheating...., ");
        }
      }
      return count;//There are <count> users are elected to be in the committee. 
    }, 3);//We do this election 3 times, then we can average the number <c>
    
    console.log('Election result: We want to elect ', a, ' committee members, we actually got ', parseInt(c), ' commitee members. They are:');
    for(var i = 0; i < users.length; i ++){
      const user = users[i];
      const winOfLose = user.j[0] > 0? "winner": "-----"
      console.log('     -', winOfLose, '-- ', user.name, ' owns ', user.owns, ' coins, ', 'voting weight(j):', user.j[0]);
      user.j = [];
    }
    
  }
  

  
  res.send("vrf test");
}