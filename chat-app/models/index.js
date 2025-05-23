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
    console.error('Erreur lors de l\'initialisation de la base:', err.stack);
  }
};

initDb();

module.exports = { sequelize };