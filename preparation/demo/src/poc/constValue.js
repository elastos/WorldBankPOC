exports.thresholdForVrfRa = 10;
exports.totalCreditToken = 10000;
exports.gasFaucetPeerId = 'faucet';
exports.gasBurnPeerId = 'fireplace';
exports.creditRewardToEverySuccessfulRa = 1;
exports.creditPentaltyToEverySuccessfulRa = 1;
exports.minimalNewNodeJoinRaDeposit = 10;
//exports.presetUsers = [{"name":"user #0","pub":"ff29e110a663a538980761b65a9bb8ae374f405f52f13a0d07b9855b6d56d2d2","pri":"b95c5ced98610f79a8811e5fda6176c664197afdc1b86bd3ff7296b2dc1f9d46ff29e110a663a538980761b65a9bb8ae374f405f52f13a0d07b9855b6d56d2d2"},{"name":"user #1","pub":"7263ed1ad45056c4f645b9c436ba6cd4793907aee0fd24690a040ab787ed4c29","pri":"6cb62827409972b54cb0d8e882f1e59065748dece16ebd99ee5efdf5a2ba3b627263ed1ad45056c4f645b9c436ba6cd4793907aee0fd24690a040ab787ed4c29"},{"name":"user #2","pub":"4a8965f969859323795055cef71e57abde3fe2b04b48dd8df7e697ea2ffb6bc1","pri":"bf6cc412d3dd108fa6ee030758640a1f552a1a30dc2b0e437e1003d770c8daa34a8965f969859323795055cef71e57abde3fe2b04b48dd8df7e697ea2ffb6bc1"},{"name":"user #3","pub":"d2d810fbd7b64ed7a1cca6592bf93b7350c40bc2b44709709be37e15080e3bb4","pri":"a8c5d473a0066c299baf82c3bb2d83b9a67c789955bde93ccc0db14ff6349081d2d810fbd7b64ed7a1cca6592bf93b7350c40bc2b44709709be37e15080e3bb4"},{"name":"user #4","pub":"4912a36f9b7493e6d5384b81c7878ca3bc0c6b2d12fcff45f2bd944d9923ac5e","pri":"d8a37b06b684529ed8303241435698be9d5b81ea22569763bb1767525ccc1b954912a36f9b7493e6d5384b81c7878ca3bc0c6b2d12fcff45f2bd944d9923ac5e"},{"name":"user #5","pub":"fc09bd033e053738ae69ceffc268f2f0be32bc5ea21eb1c79a19726010ba4391","pri":"f35154b33786c0bd0e8407c54876eea0184ab3f8eead2a3242f7e14edcbaac92fc09bd033e053738ae69ceffc268f2f0be32bc5ea21eb1c79a19726010ba4391"},{"name":"user #6","pub":"d588c3480433a291e01b46287ba5d5e0b6953a956378cd0766a78bf4aa7dfb21","pri":"5b4eb8dbd19c9842d65e9a560ae221794d1cf64e3b0e130b1e21b6d85e072031d588c3480433a291e01b46287ba5d5e0b6953a956378cd0766a78bf4aa7dfb21"},{"name":"user #7","pub":"876c2e0aac5a5c9fb3d7d66fddb494879b205eb1c05a035b1343c6b2070b42b9","pri":"19270a464e0c1eefe03a2af7cc71e0c3f0c334c9829deb8adbb8629c13625297876c2e0aac5a5c9fb3d7d66fddb494879b205eb1c05a035b1343c6b2070b42b9"},{"name":"user #8","pub":"6773fb2c7ce91fa0cd1c2a442710bd29a1e06f48dafc15439587028e15c2ee3a","pri":"48ad7c56ccbf72b6c4b3c6dab5dc35001c1d8a691930318001152945987dcd486773fb2c7ce91fa0cd1c2a442710bd29a1e06f48dafc15439587028e15c2ee3a"},{"name":"user #9","pub":"03698d6cbedd987427626505ffc9aa2869b88a84117eef0d94caec91a54d2e47","pri":"ece6c35a4c46eb7b6ce2485dfcf4a5f68e664c2d75fbe0ded7ea5470d317f16303698d6cbedd987427626505ffc9aa2869b88a84117eef0d94caec91a54d2e47"}];

exports.tryParseJson = (s)=>{
  try{
    return JSON.parse(s);
  }
  catch(e){
    return undefined;
  }
}