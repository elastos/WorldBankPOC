import {tryParseJson} from '../constValue';
import {log} from '../PotLog';

export default (ipfs, room, options)=>{
  return (m)=>{
    const {globalState} = options;
    const messageString = m.data.toString();
    const messageObj = tryParseJson(messageString);
    if(! messageObj)
      return console.log("townHallMessageHandler received non-parsable message, ", messageString);
    switch(messageObj.type){
      case "resUserInfo":
        const {userInfo} = messageObj;
        globalState.trustedPeerToUserInfo[m.from] = userInfo;
        console.log("trustedPeerToUserInfo, ", globalState.trustedPeerToUserInfo);

        log('user_online', {
          name : userInfo.userName,
          ipfs_id : m.from
        });
        break;
      //case "computeTaskWinnerApplication":
        //console.log('layerOne townhall, record the highest J value.', messageObj);
  //       "type": "computeTaskWinnerApplication",
  // "ipfsPeerId": "QmcRcLKdqpydWjKYxgDGSUZ5Qyh4NqNxikLFG3KJ6yLQoj",
  // "userName": "user #16",
  // "publicKey": "bae714c4e682fa0d36dd11fd73a3113817ec521df3f337757f78ad7392f061d9",
  // "taskCid": "bafyreihjakj2lrb5blk7jsve4kookxhjvwiawfc2aaptogoskfahbvehie",
  // "proof": "025eb4b325b16db6969967eb58081272d8ca3d4f986ea5efdf29180de0a86cca733763a4a1814b9b975b0bf1e25faede8665d3d95598ba55b7b10680b23801fdd367943070e67f96729957ba4348339ec2",
  // "value": "5eb4b325b16db6969967eb58081272d8ca3d4f986ea5efdf29180de0a86cca73",
  // "j": "1",
  // "blockHeightWhenVRF": 2
        //globalState.pendingTasks[messageObj.taskCid].followUps.push(messageObj);
        //break;
      default:
        return console.log("townHallMessageHandler received unknown type message object,", messageObj );
    }
  }
};

