const Database = require('better-sqlite3');
const path = require('path');

// Chemin vers le fichier de base de données
const DB_PATH = path.join(__dirname, 'ma_base.sqlite');

// Création d'une nouvelle instance de base de données
const db = new Database(DB_PATH);

try {
    // Création de la table users si elle n'existe pas
    // db.exec(`
    //     CREATE TABLE IF NOT EXISTS users (
    //       id INTEGER PRIMARY KEY AUTOINCREMENT,
    //       user_name TEXT NOT NULL UNIQUE,
    //       password TEXT NOT NULL,
    //       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    //     );
    // `);
    // create table conversations
    db.exec(`
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT, -- pour groupe ou nom visible
            is_group BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
    // // create table conversation_participants
    // db.exec(`
    //     CREATE TABLE IF NOT EXISTS conversation_participants (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     conversation_id INTEGER NOT NULL,
    //     user_id INTEGER NOT NULL,
    //     joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    //     FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    //     FOREIGN KEY (user_id) REFERENCES users(id)
    //     );
    // `);
    // //new version of table messages
    // db.exec(`
    //     CREATE TABLE IF NOT EXISTS messages (
    //         id INTEGER PRIMARY KEY AUTOINCREMENT,
    //         conversation_id INTEGER NOT NULL,
    //         sender_id INTEGER NOT NULL,
    //         text TEXT NOT NULL,
    //         sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    //         FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    //         FOREIGN KEY (sender_id) REFERENCES users(id)
    //     );
    // `);
    // db.exec(`
    //    CREATE TABLE IF NOT EXISTS message_status (
    //         id INTEGER PRIMARY KEY AUTOINCREMENT,
    //         message_id INTEGER NOT NULL,
    //         user_id INTEGER NOT NULL,
    //         status TEXT DEFAULT 'delivered', -- ou 'seen', 'deleted'
    //         updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    //         FOREIGN KEY (message_id) REFERENCES messages(id),
    //         FOREIGN KEY (user_id) REFERENCES users(id)
    //     );
 
    // `);
    //optimisation case 
    // db.exec(`
    //     CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
    //     CREATE INDEX idx_messages_sender_id ON messages(sender_id);
    //     CREATE INDEX idx_participants_user_id ON conversation_participants(user_id);
    //     CREATE INDEX idx_status_user_msg ON message_status(user_id, message_id);

    //     ALTER TABLE conversations ADD COLUMN last_message_id INTEGER;

    //     ALTER TABLE messages ADD COLUMN type TEXT DEFAULT 'text'; -- ex: 'text', 'image', 'file'

    //     ALTER TABLE messages ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

    //     ALTER TABLE users ADD COLUMN updated_at DATETIME;
    //     ALTER TABLE messages ADD COLUMN edited_at DATETIME;
    // `);

    // for future attachments
    // db.exec(`
    //     CREATE TABLE attachments (
    //         id INTEGER PRIMARY KEY,
    //         message_id INTEGER,
    //         file_url TEXT,
    //         file_type TEXT, -- image, audio, etc.
    //         file_size INTEGER,
    //         FOREIGN KEY (message_id) REFERENCES messages(id)
    //     );
    // `);

    
    console.log("Tables created successfully");
    
    // Préparation des requêtes utilisées fréquemment
    const statements = {
        // Users
        insertUser: db.prepare('INSERT INTO users (user_name, user_password) VALUES (?, ?)'),
        findUserByUsername: db.prepare('SELECT * FROM users WHERE user_name = ?'),
        getAllUsers: db.prepare('SELECT user_name FROM users'),
        
        // Conversations
        insertConversation: db.prepare('INSERT INTO conversations (title, is_group) VALUES (?, ?)'),
        getConversations: db.prepare('SELECT * FROM conversations'),
        
        // Messages
        insertMessage: db.prepare('INSERT INTO messages (conversation_id, sender_id, text) VALUES (?, ?, ?)'),
        getMessages: db.prepare('SELECT * FROM messages ORDER BY id DESC LIMIT ? OFFSET ?'),
        getMessagesCount: db.prepare('SELECT COUNT(*) as count FROM messages'),
        
    };
    
    module.exports = { db, statements };
    
} catch (error) {
    console.error("Database initialization error:", error);
    process.exit(1);
}