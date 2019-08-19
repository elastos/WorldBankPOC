# totalCreditForOnLineNodes 

## Current:
 we calcualte totalCreditForOnLineNodes when RemoteAttestor or New Node or Block Producer validate RA task. Because the validate time might be different than the Remote Attestaor running its own VRF. So we could verify fail a valid RA VRF. 

## Fix:
We should have a totalOnline Nodes total credit in block. So that we can validate the number based on block hgiths and check its totalCredit at that moment of that height.

## Completed

# If no one successfully VRF to win a RA task. The escrow will not get returned and RV will not get processed.

