const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "1234";
console.log("ADMIN_PASSWORD détecté depuis l'environnement :", !!process.env.ADMIN_PASSWORD);

app.use(express.json());
app.use(express.static(__dirname));

// Connexion à la base PostgreSQL de Render
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Crée la table si elle n'existe pas encore, et insère une ligne par défaut
async function initDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS stats (
            id INTEGER PRIMARY KEY DEFAULT 1,
            followers TEXT NOT NULL DEFAULT 'GAMING',
            likes TEXT NOT NULL DEFAULT '1709',
            domaine TEXT NOT NULL DEFAULT '1136'
        );
    `);

    const result = await pool.query('SELECT * FROM stats WHERE id = 1');
    if (result.rows.length === 0) {
        await pool.query(
            'INSERT INTO stats (id, followers, likes, domaine) VALUES (1, $1, $2, $3)',
            ['GAMING', '1709', '1136']
        );
    }
}

// Sert index.html sur la racine du site
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Vérifie le mot de passe admin (utilisé par l'écran de connexion)
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ ok: true });
    } else {
        res.status(401).json({ ok: false });
    }
});

// Récupère les stats depuis la base (accessible à tous, en lecture seule)
app.get('/api/stats', async (req, res) => {
    try {
        const result = await pool.query('SELECT followers, likes, domaine FROM stats WHERE id = 1');
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Impossible de lire les statistiques." });
    }
});

// Met à jour les stats — protégé par le mot de passe admin
app.post('/api/stats', async (req, res) => {
    const { followers, likes, domaine, password } = req.body;
    console.log("POST /api/stats reçu avec :", { followers, likes, domaine });

    if (password !== ADMIN_PASSWORD) {
        console.log("Mot de passe refusé.");
        return res.status(401).json({ error: "Mot de passe incorrect." });
    }

    try {
        const result = await pool.query(
            'UPDATE stats SET followers = $1, likes = $2, domaine = $3 WHERE id = 1',
            [followers, likes, domaine]
        );
        console.log("Lignes mises à jour :", result.rowCount);
        res.json({ message: "OK" });
    } catch (err) {
        console.error("Erreur lors de la sauvegarde :", err);
        res.status(500).json({ error: "Impossible de sauvegarder les statistiques." });
    }
});

initDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Serveur démarré sur le port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("Erreur de connexion à la base de données :", err);
    });
