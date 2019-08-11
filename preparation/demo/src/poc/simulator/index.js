require("babel-core/register");
require("babel-polyfill");

exports.townHall = require('./townHall');
exports.taskRoom = require('./taskRoom');
exports.blockRoom = require('./blockRoom');
exports.roomMessageHandler = require('./roomMeesageHandler');