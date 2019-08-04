const PEERID_RESERVE = '0';
const transferCreditBalanced = async (fromPeerId, toPeerId, amt) => {

};

exports.depositToReserve = async (fromPeerId, amt) => {
  return transferCreditBalanced(fromPeerId, PEERID_RESERVE, amt);
};

exports.withdrawFromReserve = async (toPeerId, amt) => {
  return transferCreditBalanced(PEERID_RESERVE, toPeerId, amt);
};