
const express = require('express');

const {result, constValue} = require('../../poc');
const {generateBlock} = require('../../poc/layerOneBlock/generateBlock.js');
const _ = require('lodash');

const {tryVrf} = require('../../poc/tryVrf')

const router = express.Router();
//console.log("credit", creditScore);
const {get, log} = require('../../poc/PotLog');

router
  .route('/')
  .get((req, res) => {
    
    const users = req.app.get('presetUsers');
    let loopUserLink = users.reduce((accumulator, u)=>{

      return accumulator + "<a href='/simulator?u=" + u.name + "&&s=" + req.app.get('swarmUrl') + "&&r=" +  req.app.get('randRoomPostfix') + "&&pub=" + u.pub + "&&pri=" + u.pri + "'  target='_blank'>Simulator for " + u.name + "</a></br>";
    }, "");
    
    const template = "<html><head></head><body>" 
    + "<p> Random Room Name Protfix is " + req.app.get('randRoomPostfix') + "</p><p><a href='/poc/forceManualGenerateNewBlock' target='_blank'>Force manually generate new block now.</a></p><p>"
    + loopUserLink
    + "</p></body></html>";
    res.status(200).send(template);
  });

router
  .route('/demo')
  .get((req, res) => {
    
    const users = req.app.get('presetUsers');
    let loopUserLink = users.reduce((accumulator, u)=>{

      return accumulator + "<a href='/webportal/ipfs_test.html?u=" + u.name + "&&s=" + req.app.get('swarmUrl') +  "&&r=" +  req.app.get('randRoomPostfix') + "&&pub=" + u.pub + "&&pri=" + u.pri + "'  target='_blank'>Simulator for " + u.name + "</a></br>";
    }, "");
    
    const template = "<html><head></head><body><h1><a href='/poc/forceManualGenerateNewBlock' target='_blank'>Force generate new block</a></h1>"
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
  .route('/forceManualGenerateNewBlock')
  .get(async (req, res) => {
    const ipfs = req.app.get('ipfs');
    const globalState = req.app.get('globalState');
    const rooms = req.app.get('pubsubRooms');
    const {blockRoom} = rooms;
    const newBlock = await generateBlock({ipfs, globalState, blockRoom})
    const htmlDoc = '<html><head></head><body><pre><code>' + JSON.stringify(newBlock, undefined, 2) + '</code></pre></body></html>';
    res.status(200).send(htmlDoc);
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

router.route('/pot_log').get((req, res)=>{
  const rs = get();
  return result(res, 1, rs);
});
router.route('/pot_log_update').post((req, res)=>{
  const type = req.query.type;
  const opts = req.body;

  log(type, opts);
  return result(res, 1, 'ok');
});


module.exports = router;
