const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const DATA_FILE = path.join(__dirname, 'messages.json');
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Lecture/écriture du fichier JSON pour les messages
function readMessages() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return []; }
}
function writeMessages(msgs) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(msgs, null, 2));
}

// Lecture/écriture du fichier JSON pour les utilisateurs
function readUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); }
  catch { return []; }
}
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Endpoint pour l'inscription
app.post('/register', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Pseudo requis.' });
  }

  const users = readUsers();
  if (users.some(user => user.username === username)) {
    return res.status(400).json({ error: 'Ce pseudo est déjà pris.' });
  }

  users.push({ username });
  writeUsers(users);
  res.status(201).json({ message: 'Inscription réussie.' });
});

// Endpoint pour la connexion
app.post('/login', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Pseudo requis.' });
  }
  console.log(username);
  const users = readUsers();
  if (!users.some(user => user.username === username)) {
    return res.status(404).json({ error: 'Utilisateur non trouvé.' });
  }
  res.status(200).json({ message: 'Connexion réussie.' });
});

// Endpoint REST pour paginer les messages
app.get('/messages', (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 20;
  const all = readMessages();
  all.sort((a, b) => a.id - b.id);
  const start = Math.max(all.length - offset - limit, 0);
  const end = all.length - offset;
  res.json({ messages: all.slice(start, end) });
});

// Socket.io pour le chat en temps réel
io.on('connection', (socket) => {
  socket.on('register', (user) => {
    socket.user = user;
    socket.join('global');
    // Envoyer la liste des noms des utilisateurs connectés
    const users = Array.from(io.sockets.sockets.values())
      .filter(s => s.rooms.has('global') && s.user)
      .map(s => s.user);
    io.to('global').emit('onlineUsers', users);
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
    // Envoyer la liste mise à jour des utilisateurs connectés
    const users = Array.from(io.sockets.sockets.values())
      .filter(s => s.rooms.has('global') && s.user)
      .map(s => s.user);
    io.to('global').emit('onlineUsers', users);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));