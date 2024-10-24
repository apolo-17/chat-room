const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors');
const Message = require('./models/message');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:8081',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  },
});

//Configuracion para manejar los archivos que se suben
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Conectar a MongoDB
mongoose.connect('mongodb://localhost/chat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Rutas
app.get('/messages', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 });
  res.json(messages);
});

app.post('/upload', upload.single('file'), (req, res) => {
    const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    console.log('File: ',fileUrl)
  res.json({ fileUrl });
});

app.use('/uploads', express.static('uploads'));

// Socket.io
io.on('connection', (socket) => {
  socket.on('sendMessage', async (messageData) => {
    try {
      const message = new Message(messageData);
      await message.save();
      io.emit('message', message);
    } catch (error) {
      console.error('Error al guardar el mensaje:', error);
    }
  });
});

// Iniciar el servidor
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
