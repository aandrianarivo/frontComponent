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
    
    // // Création de la table messages si elle n'existe pas
    // db.exec(`
    //     CREATE TABLE IF NOT EXISTS messages (
    //       id INTEGER PRIMARY KEY AUTOINCREMENT,
    //       user TEXT NOT NULL,
    //       text TEXT NOT NULL,
    //       timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    //     );
    // `);
    
    console.log("Tables created successfully");
    
    // Préparation des requêtes utilisées fréquemment
    const statements = {
        // Users
        insertUser: db.prepare('INSERT INTO users (user_name, user_password) VALUES (?, ?)'),
        findUserByUsername: db.prepare('SELECT * FROM users WHERE user_name = ?'),
        getAllUsers: db.prepare('SELECT user_name FROM users'),
        
        // Messages
        insertMessage: db.prepare('INSERT INTO messages (user, text) VALUES (?, ?)'),
        getMessages: db.prepare('SELECT * FROM messages ORDER BY id DESC LIMIT ? OFFSET ?'),
        getMessagesCount: db.prepare('SELECT COUNT(*) as count FROM messages')
    };
    
    module.exports = { db, statements };
    
} catch (error) {
    console.error("Database initialization error:", error);
    process.exit(1);
}