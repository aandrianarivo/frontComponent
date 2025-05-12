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

// Lecture/écriture du fichier JSON
function readMessages() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return []; }
}
function writeMessages(msgs) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(msgs, null, 2));
}

// Endpoint REST pour paginer
app.get('/messages', (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 20;
  const all = readMessages();
  // Trier par id croissant
  all.sort((a,b) => a.id - b.id);
  const start = Math.max(all.length - offset - limit, 0);
  const end = all.length - offset;
  res.json({ messages: all.slice(start, end) });
});

// Socket.io pour le chat en temps réel
io.on('connection', (socket) => {
  socket.on('register', (user) => {
    socket.user = user;
    socket.join('global');
    io.to('global').emit('onlineUsers', Array.from(io.sockets.adapter.rooms.get('global') || []));
  });

  socket.on('newMessage', (text) => {
    const msg = {
      id: Date.now(),
      user: socket.user,
      text,
      timestamp: new Date().toISOString(),
    };
    const all = readMessages();
    all.push(msg);
    writeMessages(all);
    io.to('global').emit('message', msg);
  });

  socket.on('disconnect', () => {
    io.to('global').emit('onlineUsers', Array.from(io.sockets.adapter.rooms.get('global') || []));
  });
});

const PORT = process.env.PORT || 5600;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));