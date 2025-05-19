const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const bcrypt = require('bcrypt');
const { statements } = require('./database');

const SALT_ROUNDS = 10; // Nombre de tours de hachage pour bcrypt

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());



// Endpoint pour l'inscription
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Pseudo et mot de passe requis.' });
  }

  // Vérifier si l'utilisateur existe déjà
  const existingUser = statements.findUserByUsername.get(username);
  if (existingUser) {
    return res.status(400).json({ error: 'Ce pseudo est déjà pris.' });
  }

  try {
    // Hachage du mot de passe avec bcrypt
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Insertion dans la base de données
    statements.insertUser.run(username, hashedPassword);
    res.status(201).json({ message: 'Inscription réussie.' });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription.' });
  }
});

// Endpoint pour la connexion
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Pseudo et mot de passe requis.' });
  }
  
  // Recherche de l'utilisateur dans la base de données
  const user = statements.findUserByUsername.get(username);
  console.log('Tentative de connexion:', user);
  
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé.' });
  }
  
  try {
    // Vérification du mot de passe avec bcrypt
    const passwordMatch = await bcrypt.compare(password, user.user_password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }
    
    res.status(200).json({ message: 'Connexion réussie.' });
  } catch (error) {
    console.error('Erreur lors de la vérification du mot de passe:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion.' });
  }
});

// Endpoint REST pour paginer les messages
app.get('/messages', (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 20;
  
  // Récupérer les messages depuis la base de données
  const messages = statements.getMessages.all(limit, offset);
  const countResult = statements.getMessagesCount.get();
  const totalCount = countResult ? countResult.count : 0;
  
  res.json({ 
    messages, 
    pagination: {
      offset,
      limit,
      total: totalCount
    }
  });
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
      user: socket.user,
      text,
      timestamp: new Date().toISOString()
    };
    
    // Insertion du message dans la base de données
    const info = statements.insertMessage.run(socket.user, text);
    msg.id = info.lastInsertRowid;
    
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