export default (globalBlock)=>{
  return ()=>{ 
    return {
      txsPool: [],
      taskPool: [],
      creditMap:{
        'God':99999
      },
      gasMap:{
        'God':99999
      },
      blockHeight:0,
      previousBlockHeight: undefined
    }
  }
};