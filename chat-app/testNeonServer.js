// testNeonServer.js
const express = require('express');
const { sequelize } = require('./models');
const bcrypt = require('bcrypt');
const { getOrCreateConversation, sendMessage, getMessages } = require('./services/chat-service');
const app = express();
const port = 4000;

app.use(express.json());

// Route de test pour vérifier la connexion à la base de données
app.get('/test-db', async (req, res) => {
  try {
    const [result] = await sequelize.query('SELECT NOW()');
    res.json({ success: true, data: result[0] });
  } catch (err) {
    console.error('Erreur de connexion à la base de données:', err.stack);
    res.status(500).json({ success: false, error: 'Erreur de connexion à la base de données' });
  }
});

// Route pour récupérer tous les utilisateurs
app.get('/users', async (req, res) => {
  try {
    const [users] = await sequelize.query('SELECT * FROM users');
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs:', err.stack);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Route pour ajouter un utilisateur
app.post('/users', async (req, res) => {
  const { user_name, password } = req.body;
  if (!user_name || !password) {
    return res.status(400).json({ success: false, error: 'user_name et password sont requis' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (user_name, password) VALUES (:user_name, :password) RETURNING *';
    const [user] = await sequelize.query(query, {
      replacements: { user_name, password: hashedPassword },
      type: sequelize.QueryTypes.INSERT,
    });
    res.json({ success: true, data: user[0] });
  } catch (err) {
    console.error('Erreur lors de l\'ajout de l\'utilisateur:', err.stack);
    res.status(500).json({ success: false, error: 'Erreur lors de l\'ajout de l\'utilisateur' });
  }
});

app.get('/test/conv', async (req, res) => {
  try {
    console.log('Test de la conversation');
    let convId = getOrCreateConversation(1, 2);
    console.log(convId);
    sendMessage(convId, 1, 'Salut John !');
    sendMessage(convId, 2, 'Salut Antonius, ça va ?');
    let messages = getMessages(convId);
    return res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error.stack);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des messages' });
  }
});

// Lancer le serveur
app.listen(port, async () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
  process.on('SIGTERM', async () => {
    await sequelize.close();
    process.exit(0);
  });
});