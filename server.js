const express = require('express');
const path = require('path');
const { Client } = require('pg'); // Module pour se connecter à PostgreSQL
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 🔐 SÉCURITÉ : Récupération des secrets via les variables d'environnement de Render
// Tu n'as plus besoin de taper ton mot de passe ou ton URL de BDD en dur ici !
const MOT_DE_PASSE_SECRET = process.env.ADMIN_PASSWORD || "ChangeMoiSurRender123!";
const DATABASE_URL = process.env.DATABASE_URL;

const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Obligatoire pour la sécurité sur Render
});

// Valeurs par défaut si la base de données est totalement vide au premier démarrage
let donneesSite = {
    stats: { followers: "150", likes: "10K", domaine: "150K", date_sauvegarde: "Non modifiée" },
    liens: [
        { texte: "🚀 Rejoins mon serveur Discord !", url: "https://discord.com/invite/V4YMKzWYEM" },
        { texte: "🔥 Mes jeux moins chers sur Instant Gaming", url: "https://www.instant-gaming.com/" },
        { texte: "🎬 Mon compte TikTok principal", url: "https://www.tiktok.com/@titidu25050" },
        { texte: "📺 Ma chaîne YouTube", url: "https://youtube.com/" },
        { texte: "📸 Mon Instagram", url: "https://instagram.com/" },
        { texte: "📩 Contact", url: "/contact.html" }
    ]
};

// Connexion et initialisation de la base de données
if (DATABASE_URL) {
    client.connect()
        .then(async () => {
            console.log("🔌 Connecté avec succès à la base de données PostgreSQL !");
            
            // Crée la table de stockage si elle n'existe pas encore
            await client.query(`
                CREATE TABLE IF NOT EXISTS configuration (
                    id SERIAL PRIMARY KEY,
                    donnees JSONB
                )
            `);

            // Essaie de charger les données existantes
            const res = await client.query('SELECT donnees FROM configuration ORDER BY id DESC LIMIT 1');
            if (res.rows.length > 0) {
                donneesSite = res.rows[0].donnees;
                console.log("💾 Données permanentes chargées depuis la base de données !");
            } else {
                // Si la base est toute neuve, on insère les valeurs par défaut
                await client.query('INSERT INTO configuration (donnees) VALUES ($1)', [donneesSite]);
                console.log("📦 Base de données initialisée avec les valeurs par défaut.");
            }
        })
        .catch(err => console.error("❌ Erreur de connexion à la base de données :", err));
} else {
    console.warn("⚠️ Attention : DATABASE_URL n'est pas définie dans l'environnement.");
}

// Route pour envoyer les données au site public
app.get('/api/stats', (req, res) => {
    res.json(donneesSite);
});

// Route de connexion pour l'admin
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === MOT_DE_PASSE_SECRET) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Mot de passe incorrect !" });
    }
});

// Route pour sauvegarder les boutons et les stats dans la BASE DE DONNÉES
app.post('/api/save', async (req, res) => {
    const { password, stats, liens } = req.body;
    if (password !== MOT_DE_PASSE_SECRET) {
        return res.status(403).json({ error: "Mot de passe invalide." });
    }
    
    donneesSite.stats = stats;
    donneesSite.liens = liens;

    try {
        await client.query('UPDATE configuration SET donnees = $1 WHERE id = (SELECT id FROM configuration ORDER BY id DESC LIMIT 1)', [donneesSite]);
        console.log("📝 Base de données PostgreSQL mise à jour avec succès !");
        res.json({ success: true });
    } catch (err) {
        console.error("Erreur lors de la sauvegarde en base :", err);
        res.status(500).json({ error: "Erreur serveur lors de la sauvegarde permanente." });
    }
});

// 🛡️ DISTRIBUTION SÉCURISÉE DES FICHIERS
// On n'expose plus tout le dossier racine. On cible uniquement les fichiers nécessaires.
// ==========================================
// ROUTES DU SITE WEB (Toutes tes pages HTML)
// ==========================================
app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, 'index.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.resolve(__dirname, 'admin.html')));
app.get('/contact.html', (req, res) => res.sendFile(path.resolve(__dirname, 'contact.html')));
app.get('/voila.png', (req, res) => res.sendFile(path.resolve(__dirname, 'voila.png')));

// Ta nouvelle page podium corrigée et bien fermée !
app.get('/podium_fullscreen.html', (req, res) => res.sendFile(path.resolve(__dirname, 'podium_fullscreen.html')));


// ==========================================
// ROUTE API (Récupération des sanctions)
// ==========================================
app.get('/api/sanctions/:type', async (req, res) => {
    let type = req.params.type.toLowerCase();
    if (!type.endsWith('s')) type += 's';
    try {
        const result = await pool.query(`SELECT * FROM ${type} ORDER BY date_added DESC`);
        res.json(result.rows);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// ==========================================
// ROUTE API (Suppression d'une sanction)
// ==========================================
app.delete('/api/sanctions/:table/:id', async (req, res) => {
    const { table, id } = req.params;
    try {
        const data = await pool.query(`SELECT user_id FROM ${table} WHERE id = $1`, [id]);
        if (data.rows.length > 0 && GUILD_ID) {
            const userId = data.rows[0].user_id;
            const guild = await client.guilds.fetch(GUILD_ID).catch(() => null);
            if (guild) {
                if (table === 'mutes') {
                    const member = await guild.members.fetch(userId).catch(() => null);
                    if (member) await member.timeout(null).catch(() => null);
                } else if (table === 'bans') {
                    await guild.bans.remove(userId).catch(() => null);
                }
            }
        }
        await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
        res.json({ success: true });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// Lancement du serveur
app.listen(PORT, () => { 
    console.log(`🚀 Serveur actif sur le port ${PORT}`); 
});
