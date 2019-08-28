
const express = require('express');

const {generateBlock} = require('../../generateBlock.js');
const _ = require('lodash');

const {tryVrf} = require('../../../shared/tryVrf')

const router = express.Router();
//console.log("credit", creditScore);
const {get, log, getData} = require('../../../shared/PotLog');

const result = (res, code, dataOrError, message='')=>{
  const json = {
    code, message
  };
  if(code > 0){
    json.data = dataOrError;
  }
  else{
    json.error = dataOrError;
  }
  res.set('Content-Type', 'application/json');
  return res.json(json);
};

router
  .route('/')
  .get((req, res) => {
    
    const users = global.presetUsers;
    let loopUserLink = users.reduce((accumulator, u)=>{

      return accumulator + "<a href='/web?u=" + u.name + "&&s=" + global.swarmUrl + "&&r=" +  global.randRoomPostfix + "&&pub=" + u.pub + "&&pri=" + u.pri + "'  target='_blank'>Simulator for " + u.name + "</a></br>";
    }, "");
    
    const template = "<html><head></head><body>" 
    + "<p> Random Room Name Protfix is " + global.randRoomPostfix + "</p><p><a href='/poc/forceManualGenerateNewBlock' target='_blank'>Force manually generate new block now.</a></p><p>"
    + loopUserLink
    + "</p></body></html>";
    res.status(200).send(template);
  });

router
  .route('/demo')
  .get((req, res) => {
    
    const users = global.presetUsers;
    let loopUserLink = users.reduce((accumulator, u)=>{

      return accumulator + "<a href='/webportal/ipfs_test.html?u=" + u.name + "&&s=" + global.swarmUrl +  "&&r=" +  global.randRoomPostfix + "&&pub=" + u.pub + "&&pri=" + u.pri + "'  target='_blank'>Simulator for " + u.name + "</a></br>";
    }, "");
    
    const template = "<html><head></head><body><h1><a href='/poc/forceManualGenerateNewBlock' target='_blank'>Force generate new block</a></h1>"
    + "<p> Random Room Name Protfix is" + global.randRoomPostfix + "</p><p>"
    + loopUserLink
    + "</p></body></html>";
    res.status(200).send(template);
  });


router.route('/get_user_by_ipfs').get((req, res)=>{
  const ipfs_id = req.query.ipfs_id;

  const users = global.presetUsers;

  const tmp = _.find(users, (item)=>item.ipfs_id === ipfs_id);
  if(tmp){
    return result(res, 1, tmp);
  }
  return result(res, 1, '');
  
});

router
  .route('/forceManualGenerateNewBlock')
  .get(async (req, res) => {
    const ipfs = global.ipfs;
    const globalState = global.globalState;
    const rooms = global.pubsubRooms;
    const {blockRoom} = rooms;
    const newBlock = await generateBlock({ipfs, globalState, blockRoom})
    const htmlDoc = '<html><head><link href="/web/css/jsoneditor.min.css" rel="stylesheet" type="text/css"><script src="/web/dist/jsoneditor.min.js"></script></head>'
     + '<body><h1>Block Height:' + newBlock.blockHeight + '</h1><p>Refresh this page to generate next block</p><div id="jsoneditor"></div><script>var container = document.getElementById("jsoneditor");var editor = new JSONEditor(container, {});editor.set('
     + JSON.stringify(newBlock)
    + ')</script></body></html>';
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
    const pubsubRooms = global.pubsubRooms;
    const ipfs = global.ipfs;
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

router.route('/pot_data').get((req, res)=>{
  const rs = getData();
  return result(res, 1, rs);
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
