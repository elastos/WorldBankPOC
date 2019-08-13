
import genesisBlock from './genesisBlock';
import blockLoop from './blockLoop';
import channelListener from './channelListener';

const globalState = {

};
exports.genesisBlock = genesisBlock(globalState);
exports.blockLoop =  blockLoop(globalState);
exports.channelListener =  channelListener(globalState);
