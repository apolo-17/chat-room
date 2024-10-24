const Message = require('./models/message'); 

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Usuario conectado');

    socket.on('sendMessage', async (messageData) => {
      const message = new Message(messageData);
      await message.save();
      io.emit('message', message);
    });

    socket.on('sendFile', async (fileData) => {
      const fileMessage = new Message(fileData);
      await fileMessage.save();
      io.emit('file', fileMessage);
    });

    socket.on('disconnect', () => {
      console.log('Usuario desconectado');
    });
  });
};
