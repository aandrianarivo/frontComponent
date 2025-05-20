const { db, statements } = require('../database');

// Créer un utilisateur
function createUser(username) {
  try {
    const stmt = db.prepare('INSERT INTO users (username) VALUES (?)');
    const info = stmt.run(username);
    return info.lastInsertRowid;
  } catch (err) {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    return user.id;
  }
}

// Créer ou retrouver une conversation entre deux utilisateurs
function getOrCreateConversation(userId1, userId2) {
  const query = `
    SELECT c.id FROM conversations c
    JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = ?
    JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = ?
    GROUP BY c.id
    HAVING COUNT(*) = 2
  `;
  const existing = db.prepare(query).get(userId1, userId2);
  if (existing) return existing.id;

  // Sinon, créer une nouvelle conversation
  const insertConv = db.prepare('INSERT INTO conversations DEFAULT VALUES');
  const conversationId = insertConv.run().lastInsertRowid;

  db.prepare('INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)').run(conversationId, userId1);
  db.prepare('INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)').run(conversationId, userId2);

  return conversationId;
}

// Envoyer un message
function sendMessage(conversationId, senderId, messageText, type = 'text') {
  const stmt = db.prepare(`
    INSERT INTO messages (conversation_id, sender_id, text, type, sent_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `);
  return stmt.run(conversationId, senderId, messageText, type);
}

// Lire tous les messages d'une conversation
function getMessages(conversationId) {
  return db.prepare(`
    SELECT m.*, u.user_name AS sender_name
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ?
    AND is_deleted = 0
    ORDER BY sent_at ASC
  `).all(conversationId);
}


module.exports = {
  createUser,
  getOrCreateConversation,
  sendMessage,
  getMessages,
};
