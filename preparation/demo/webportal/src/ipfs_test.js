const _ipfs = require('./ipfs');

const log = (str)=>{
  const html = _ipfs.log(str);
  $('.js_html').append(html);
}
window.poc = {
  joinRoom(roomName){
    _ipfs.createIPFS(async (ipfs)=>{
      
  
      log('ipfs init success');
  
      _ipfs.room.register(roomName, (ipfs, room)=>{
        const option = {};
  
        const messageHandlers = [];
        
        messageHandlers.push({
          message: 'peer joined', 
          handler: (peer)=>{
            log('peer ' + peer + ' joined room');
          }
        });
        messageHandlers.push({
          message: 'peer left', 
          handler: (peer)=>{
            log('peer ' + peer + ' left room');
          }
        });
        messageHandlers.push({
          message: 'peer joined', 
          handler: (peer) => {
            log('Hello ' + peer + ' welcome join the Room!');
            room.sendTo(peer, 'Hello ' + peer + ' welcome join the Room!')
          }
        });
        messageHandlers.push({
          message:'subscribed', 
          handler: (m) => {
            log("...... subscribe...."+m);
          }
        });
        messageHandlers.push({
          message: 'message',
          handler: (message) => {
            log('test_block room got message from ' + message.from + ': ' + message.data.toString())
          }
        });

  
        window._room = room;
        return messageHandlers;
      });
  
      const d = await ipfs.id();
      log(JSON.stringify(d));
    });
  },

  broadcast(roomName, msg){
    _room.broadcast(msg);
  }
};