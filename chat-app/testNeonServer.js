const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 4000;

// Remplacez par votre URL de connexion Neon
const connectionString = 'postgresql://neondb_owner:npg_HmwQ64ZSpEiY@ep-raspy-dew-ab7frtsp-pooler.eu-west-2.aws.neon.tech/chat-app-db?sslmode=require';

// Configuration du client PostgreSQL
const pool = new Pool({
    connectionString: connectionString,
});

// Middleware pour parser le JSON
app.use(express.json());

// Fonction pour créer la table users
const createTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            user_name TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        const client = await pool.connect();
        await client.query(query);
        console.log('Tableau users créé ou déjà existant');
        client.release();
    } catch (err) {
        console.error('Erreur lors de la création de la table:', err.stack);
    }
};

// Exécuter la création de la table au démarrage
createTable();

// Route de test pour vérifier la connexion à la base de données
app.get('/test-db', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ success: false, error: 'Erreur de connexion à la base de données' });
    }
});

// Route pour récupérer tous les utilisateurs
app.get('/users', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users');
        client.release();
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ success: false, error: 'Erreur lors de la récupération des utilisateurs' });
    }
});

// Route pour ajouter un utilisateur (pour tester)
app.post('/users', async (req, res) => {
    const { user_name, password } = req.body;
    if (!user_name || !password) {
        return res.status(400).json({ success: false, error: 'user_name et password sont requis' });
    }
    try {
        const client = await pool.connect();
        const query = 'INSERT INTO users (user_name, password) VALUES ($1, $2) RETURNING *';
        const values = [user_name, password];
        const result = await client.query(query, values);
        client.release();
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ success: false, error: 'Erreur lors de l\'ajout de l\'utilisateur' });
    }
});

// Lancer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});