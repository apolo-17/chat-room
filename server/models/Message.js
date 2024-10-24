const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    username: { type: String, required: true },
    text: { type: String, required: false },
    timestamp: { type: Date, default: Date.now },
    fileUrl: { type: String, required: false },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
