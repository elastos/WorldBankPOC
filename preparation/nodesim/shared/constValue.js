exports.thresholdForVrfRa = 10;
exports.totalCreditToken = 1000;
exports.gasFaucetPeerId = 'faucet';
exports.gasBurnPeerId = 'fireplace';
exports.creditRewardToEverySuccessfulRa = 1;
exports.creditPentaltyToEverySuccessfulRa = 1;
exports.minimalNewNodeJoinRaDeposit = 10;
exports.minRemoteAttestatorsToPassRaTask = 2;
exports.expectNumberOfRemoteAttestatorsToBeVoted = 5;
exports.initialCreditIssuedWhenPassRa = 10;
exports.awardCreditWhenRaSuccessful = 1;
exports.penaltyCreditWhenRaFail = 1;
exports.reduceFactualIfRaFail = 0.5;
exports.expectNumberOfExecutorGroupToBeVoted = 5;
exports.minBlockDelayRequiredBeforeComputeStart = 1;
exports.mBlockDelayRequiredBeforeComputeStart = 3;
exports.minComputeGroupMembersToStartCompute = 2;
exports.maxBlockDelayRequiredBeforeComputeStart = 3;
exports.ComputeTaskRoles = {
  taskOwner:0,
  lambdaOwner:1,
  executeGroupNumber:2
}
exports.tryParseJson = (s)=>{
  try{
    return JSON.parse(s);
  }
  catch(e){
    return undefined;
  }
}