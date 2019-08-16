
const express = require('express');

const {creditScore, potSim, remoteAttestationSim, potSchema, betterResponse, gasSim, result, constValue, txLogSchema} = require('../../poc');

const _ = require('lodash');

const {tryVrf} = require('../../poc/tryVrf')

const router = express.Router();
//console.log("credit", creditScore);
router
  .route('/')
  .get((req, res) => {
    
    const users = req.app.get('presetUsers');
    let loopUserLink = users.reduce((accumulator, u)=>{

      return accumulator + "<a href='/simulator?u=" + u.name + "&&r=" +  req.app.get('randRoomPostfix') + "&&pub=" + u.pub + "&&pri=" + u.pri + "'  target='_blank'>Simulator for " + u.name + "</a></br>";
    }, "");
    
    const template = "<html><head></head><body>" 
    + "<p> Random Room Name Protfix is" + req.app.get('randRoomPostfix') + "</p><p>"
    + loopUserLink
    + "</p></body></html>";
    res.status(200).send(template);
  });

router
  .route('/demo')
  .get((req, res) => {
    
    const users = req.app.get('presetUsers');
    let loopUserLink = users.reduce((accumulator, u)=>{

      return accumulator + "<a href='/webportal/ipfs_test.html?u=" + u.name + "&&r=" +  req.app.get('randRoomPostfix') + "&&pub=" + u.pub + "&&pri=" + u.pri + "'  target='_blank'>Simulator for " + u.name + "</a></br>";
    }, "");
    
    const template = "<html><head></head><body>" 
    + "<p> Random Room Name Protfix is" + req.app.get('randRoomPostfix') + "</p><p>"
    + loopUserLink
    + "</p></body></html>";
    res.status(200).send(template);
  });

router.route('/update_ipfs_id').get((req, res)=>{
  const user = decodeURIComponent(req.query.user);
  const ipfs_id = req.query.ipfs_id;

  const users = req.app.get('presetUsers');

  const i = _.findIndex(users, (item)=>item.name === user);
  if(i !== -1){
    users[i].ipfs_id = ipfs_id;
  }
  req.app.set('presetUsers', users);

  res.status(200).send('ok');
});
router.route('/get_user_by_ipfs').get((req, res)=>{
  const ipfs_id = req.query.ipfs_id;

  const users = req.app.get('presetUsers');

  const tmp = _.find(users, (item)=>item.ipfs_id === ipfs_id);
  if(tmp){
    return result(res, 1, tmp);
  }
  return result(res, 1, '');
  
});

router
  .route('/status')
  .get((req, res) => {
    res.send('You will see updates here');
  });

router
  .route('/vrf')
  .get((req, res)=>{
    tryVrf(req, res);
  });
router
  .route('/publish2room')
  .post( async (req, res)=>{
    const pubsubRooms = req.app.get('pubsubRooms');
    const ipfs = req.app.get('ipfs');
    const {jsontext, room} = req.body;
    try{
      const jsonObj = JSON.parse(jsontext);
      const txType = jsonObj.txType;
      let channelRoom;
      let cid;
      const broadcastObj = {txType};
      switch(txType){
        case "gasTransfer":{
          channelRoom = pubsubRooms.taskRoom;
          const {fromPeerId, toPeerId, amt} = jsonObj;
          const cid = await ipfs.dag.put({
            fromPeerId, toPeerId, amt
          });
          broadcastObj.cid = cid.toBaseEncodedString();
          break;
        }
        case "showGlobalState":
          channelRoom = pubsubRooms.townHall;
          break;
        case "newNodeJoinNeedRa":{
          channelRoom = pubsubRooms.taskRoom;
          const {newPeerId, depositAmt, ipfsPeerId} = jsonObj;
          const cid = await ipfs.dag.put({
            newPeerId, depositAmt, ipfsPeerId
          });
          broadcastObj.cid = cid.toBaseEncodedString();
          break;
        }
  
        case "blockroom":
          channelRoom = pubsubRooms.blockRoom;
          break;
        default:
          return res.status(502).send("unsupported pubsub room,", room);
      }
      console.log('broadcastObj', broadcastObj);
      channelRoom.broadcast(JSON.stringify(broadcastObj));
      return res.status(200).send(JSON.stringify(broadcastObj));

    }
    catch(e){
      res.status(502).send(e);
    }
  });

router
  .route('/newNodeJoin')
  .get(async (req, res) => {
    const {peerId, hacked, depositGasTxId, json, lat, lng} = req.query;
    const credit = await creditScore.get(peerId);
    if(credit && credit.creditScore && credit.creditScore > 0){
      if(json){
        return result(res, -1, 'Please change peerID, since this peerId has existed');
      }
      return betterResponse.responseBetterJson(res, {peerId, hacked, depositGasTxId}, {error:'Please change peerID, since this peerId has existed'});
    }
    if(! depositGasTxId){
      if(json){
        return result(res, -1, 'In order to join the trusted network, you have to pay a init gas fee for other trusted nodes to give you an approval based on PoT value. This is called Remote Attestation. Please attach the txId of your deposit to Escrow account');
      }
      return betterResponse.responseBetterJson(res, {peerId, hacked, depositGasTxId}, {error:'In order to join the trusted network, you have to pay a init gas fee for other trusted nodes to give you an approval based on PoT value. This is called Remote Attestation. Please attach the txId of your deposit to Escrow account'});
    
    }
    const depositGasTxIdValidation = (no_use, {fromPeerId, toPeerId, amt, tokenType, referenceEventType, referenceEventId})=>{
      if(fromPeerId != constValue.gasFaucetPeerId){
        if(fromPeerId != peerId) return false;
      }
      if(amt < 10)  return false;
      
      if(tokenType != 'gas') return false;
      if(referenceEventType != 'NewNodeJoinDepositGas_ref_peerId') return false;
      if((referenceEventId != constValue.gasFaucetPeerId) && (referenceEventId != peerId)) return false;
      return true;
    }; 
    if(! await txLogSchema.doValidationOnGasTx(depositGasTxId, '', depositGasTxIdValidation)){
      return betterResponse.responseBetterJson(res, {peerId, hacked, depositGasTxId}, {error:'We cannot find the Proof of Payment from the TxId You attached. In order to join the trusted network, you have to pay a init gas fee for other trusted nodes to give you an approval based on PoT value. This is called Remote Attestation. Please attach the txId of your deposit to Escrow account'});
    
    }
    
    const newCredit = await creditScore.set(peerId, '0');

    const potObj = potSim.createPlaceHolderPot({peerId, hacked: hacked == 'true', depositGasTxId});

    const potHash = sha256(JSON.stringify(potObj));
    potObj.potHash = potHash;
    potObj.location = [lat || 0, lng || 0];
    const newPotObj = await potSchema.newPot(potObj);
    if(json){
      return result(res, 1, newPotObj);
    }
    betterResponse.responseBetterJson(res, {peerId, hacked}, {newPotObj});
  });

router
  .route('/checkCredit/:id')

  .get(async (req, res, next) => {
    try {
      const { id } = req.params;
      const credit = await creditScore.get(id);
      if (credit) {
        return res.json(credit);
      }
      return next();
    } catch (error) {
      return res.json(error.message);
    }
  });

router
  .route('/setPeerScore')
  .get(async (req, res) => {
    try {
      const { peerId, score, json } = req.query;
      const r = await creditScore.set(peerId, score);
      if(json){
        return result(res, 1, r);
      }
      return betterResponse.responseBetterJson(res, req.query, {r});
    } catch (error) {
      console.log('error line13', error);
      return res.json(error.message);
    }
  });

  // router
  // .route('/potVerify')
  // .post((req, res, next) => {
  //   const {wannaPass} = req.query;
  //   const {pot} = req.body;
    
  //   if(potObj){
  //     return res.json(potObj);
  //   }else{
  //     return next();
  //   }
  // })
  // .get((req, res) => {
  //   const {badPot, wannaPass} = req.query;
  //   const testPot = badPot? potSim.sampleBadPot() : potSim.sampleGoodPot();
  //   const bForcePass = wannaPass? true: false;
  //   return res.send( potSim.verifyPot(testPot, bForcePass));
  // });

router
  .route('/tryRa')
  .get(async (req, res, next) => {
    const {peerId, potHash, json} = req.query;
    const rs = await remoteAttestationSim.tryRa({peerId, potHash});
    console.log('tryRa => ', rs);
    if(json){
      if(rs.result && rs.result !== 'error'){
        return result(res, 1, rs);
      }else{
        return result(res, -1, rs.message)
      }
      
    }
    betterResponse.responseBetterJson(res, {peerId, potHash}, rs);
  });

router
  .route('/potList')
  .get(async (req, res)=>{
    let list = await potSchema.getAll();
    const ids = _.map(list, (item)=>{
      return item.peerId;
    });
    const cs = await creditScore.find({
      peerId : {
        $in : ids
      }
    }).exec();
    const gs = await gasSim.find({
      peerId : {
        $in : ids
      }
    }).exec();
    list = _.map(list, (item)=>{
      const tmp = _.find(cs, (x)=>x.peerId===item.peerId);
      const tmp1 = _.find(gs, (x)=>x.peerId===item.peerId);

      const rs = item.toJSON();
      rs.creditScore = tmp.creditScore;
      rs.gas = tmp1.gasBalance
      return rs;
    });
    return result(res, 1, list);
  });

router
  .route('/deletePot')
  .get(async (req, res)=>{
    const {peerId} = req.query;
    
    try{
      await gasSim.remove({peerId});
      await creditScore.remove({peerId});
      await potSchema.remove({peerId});

      return result(res, 1, 'ok');
    }catch(e){
      return result(res, -1, e.toString());
    }
    

    
  });

router
  .route('/txLogs/:peerId')
  .get(async (req, res)=>{
    const { peerId } = req.params;
    const list = await txLogSchema.getAllByPeerId(peerId);

    return result(res, 1, list);
  });

router
  .route('/createGenesisPot')
  .get(async (req, res)=>{
    try{
      await potSim.createGenesisPot();
      return result(res, 1, 'ok');
    }catch(e){
      return result(res, -1, e.toString());
    }
      
  });

router 
  .route('/joinTask')
  .get(async (req, res)=>{
    const {peerId, taskId} = req.query;

    const taskService = service.getTaskService();
    try{
      const rs = await taskService.joinToElectHandleTask(peerId, taskId);
      return result(res, 1, rs);
    }catch(e){
      return result(res, -1, e.toString());
    }
  });
router
  .route('/crateNewTask')
  .get(async (req, res)=>{
    const {peerId, amt, type} = req.query;

    const taskService = service.getTaskService();
    try{
      let rs = '';
      if(type === 'ra'){
        rs = await taskService.createNewRATask(peerId);
      }
      else{
        rs = await taskService.createNewCalculateTask(peerId, _.toNumber(amt));
      }
      return result(res, 1, rs);
    }catch(e){
      return result(res, -1, e.toString());
    }
  });

router
  .route('/taskList')
  .get(async (req, res)=>{
    const taskService = service.getTaskService();
    const {peerId} = req.query;
    try{
      const can_join_list = await taskService.getAllTask({
        status : 'elect',
        $nor : [
          {
            joiner: peerId
          }
        ]
      });
      const join_list = await taskService.getAllTask({
        joiner : peerId
      });
      const own_list = await taskService.getAllTask({peerId});
      return result(res, 1, {
        can_join_list, join_list, own_list
      });
    }catch(e){
      return result(res, -1, e.toString());
    }
  });

router
  .route('/taskLog')
  .get(async (req, res)=>{
    const taskService = service.getTaskService();
    const {taskId} = req.query;
    try{
      
      const list = await taskService.getAllTaskLog({taskId});
      return result(res, 1, list);
    }catch(e){
      return result(res, -1, e.toString());
    }
  })



module.exports = router;
