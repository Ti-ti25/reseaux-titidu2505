const express = require('express');
const path = require('path');
const { Pool } = require('pg'); // On garde l'outil de base de données pour Discord
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Distribue tous tes fichiers (index.html, admin.html, warns.html, images...)
app.use(express.static(__dirname));

// -------------------------------------------------------------
// CONFIGURATION DE LA BASE DE DONNÉES RENDER (POUR DISCORD)
// -------------------------------------------------------------
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Création automatique des tables Discord (sans toucher à TikTok)
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS mutes (
                id SERIAL PRIMARY KEY,
                username TEXT NOT NULL,
                user_id TEXT NOT NULL,
                reason TEXT NOT NULL,
                moderator TEXT NOT NULL,
                duration TEXT NOT NULL,
                date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS warns (
                id SERIAL PRIMARY KEY,
                username TEXT NOT NULL,
                user_id TEXT NOT NULL,
                reason TEXT NOT NULL,
                moderator TEXT NOT NULL,
                date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS bans (
                id SERIAL PRIMARY KEY,
                username TEXT NOT NULL,
                user_id TEXT NOT NULL,
                reason TEXT NOT NULL,
                moderator TEXT NOT NULL,
                date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Tables de modération Discord prêtes ! 🛡️");
    } catch (err) {
        console.error("Erreur base de données :", err);
    }
};
initDb();

// -------------------------------------------------------------
// PARTIE 1 : TON SITE TIKTOK (REMIS EXACTEMENT COMME AVANT)
// -------------------------------------------------------------
let stats = {
    followers: "150",
    likes: "10K",
    domaine: "150K",
    date_sauvegarde: "Non modifiée"
};

// Envoie la page TikTok à la racine
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Récupérer les stats TikTok
app.get('/api/stats', (req, res) => {
    res.json(stats);
});

// Modifier les stats TikTok depuis admin.html
app.post('/api/stats', (req, res) => {
    stats = {
        followers: req.body.followers,
        likes: req.body.likes,
        domaine: req.body.domaine,
        date_sauvegarde: req.body.date_sauvegarde
    };
    res.json({ message: "OK" });
});


// -------------------------------------------------------------
// PARTIE 2 : TON PANEL DISCORD (BASE DE DONNÉES SQL)
// -------------------------------------------------------------

// Récupérer les mutes, warns ou bans
app.get('/api/sanctions/:type', async (req, res) => {
    const type = req.params.type;
    if (!['mutes', 'warns', 'bans'].includes(type)) return res.status(400).json({ error: "Type invalide" });

    try {
        const result = await pool.query(`SELECT * FROM ${type} ORDER BY date_added DESC`);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ajouter une sanction depuis ajouter.html
app.post('/api/sanctions', async (req, res) => {
    const { type, username, user_id, reason, moderator, duration } = req.body;

    try {
        if (type === 'mute') {
            await pool.query(
                'INSERT INTO mutes (username, user_id, reason, moderator, duration) VALUES ($1, $2, $3, $4, $5)',
                [username, user_id, reason, moderator, duration || 'Non spécifiée']
            );
        } else if (type === 'warn') {
            await pool.query(
                'INSERT INTO warns (username, user_id, reason, moderator) VALUES ($1, $2, $3, $4)',
                [username, user_id, reason, moderator]
            );
        } else if (type === 'ban') {
            await pool.query(
                'INSERT INTO bans (username, user_id, reason, moderator) VALUES ($1, $2, $3, $4)',
                [username, user_id, reason, moderator]
            );
        }
        res.json({ success: true, message: "Sanction ajoutée avec succès !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
