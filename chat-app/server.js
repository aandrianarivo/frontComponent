// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const DATA_FILE = path.join(__dirname, 'messages.json');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function readMessages() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeMessages(msgs) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(msgs, null, 2));
}

// REST endpoint: charger un batch depuis la fin
app.get('/messages', (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 3;
  const all = readMessages();
  const start = Math.max(all.length - offset - limit, 0);
  const end = all.length - offset;
  const batch = all.slice(start, end);
  res.json({ messages: batch });
});

// Socket.io: diffusion des nouveaux messages
io.on('connection', (socket) => {
  socket.on('newMessage', (msg) => {
    const all = readMessages();
    const fullMsg = {
      id: Date.now(),
      user: msg.user,
      text: msg.text,
      timestamp: new Date().toISOString(),
    };
    all.push(fullMsg);
    writeMessages(all);
    io.emit('message', fullMsg);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));