const { Sequelize } = require('sequelize');
require('dotenv').config(); // Charger les variables d'environnement

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Nécessaire pour Neon
    },
  },
});

let tables = [
  `
    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      title TEXT,
      is_group BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS conversation_participants (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id),
      FOREIGN KEY (sender_id) REFERENCES users(id)
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS message_status (
      id SERIAL PRIMARY KEY,
      message_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'delivered',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (message_id) REFERENCES messages(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `
];

const initDb = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      user_name TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données réussie');
    await sequelize.query(query);
    console.log('Tableau users créé ou déjà existant');
  } catch (err) {
    console.error('Erreur lors de l\'initialisation de la base:', err);
  }
};
const createTables = async (cmd) => {
  const query = cmd
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données réussie');
    await sequelize.query(query);
    console.log('Tableau créé ou déjà existant');
  }catch (err) {
    console.error('Erreur lors de l\'initialisation de la base:', err.stack);
  }
};
tables.forEach(async (table) => {
  await createTables(table);
});
// initDb();

module.exports = { sequelize };