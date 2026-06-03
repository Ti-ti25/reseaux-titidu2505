const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Permet au serveur de lire les données JSON envoyées par le JavaScript
app.use(express.json());

// 🔐 TON MOT DE PASSE SECRET (Tu peux le modifier ici entre les guillemets)
const MOT_DE_PASSE_SECRET = "Tristan2026";

// 📦 Stockage initial de tes données (Stats + tes Boutons d'origine)
let donneesSite = {
    stats: {
        followers: "150",
        likes: "10K",
        domaine: "150K",
        date_sauvegarde: "Non modifiée"
    },
    liens: [
        { texte: "🚀 Rejoins mon serveur Discord !", url: "https://discord.com/invite/V4YMKzWYEM" },
        { texte: "📺 Ma chaîne YouTube", url: "https://youtube.com/" },
        { texte: "📸 Mon Instagram", url: "https://instagram.com/ton_pseudo" },
        { texte: "📩 Contact", url: "/contact.html" }
    ]
};

// 🟢 [GET] Route publique pour que l'index récupère les stats et les boutons
app.get('/api/stats', (req, res) => {
    res.json(donneesSite);
});

// 🔵 [POST] Route de connexion pour vérifier le mot de passe de l'admin
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === MOT_DE_PASSE_SECRET) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Mot de passe incorrect !" });
    }
});

// 🔴 [POST] Route sécurisée pour sauvegarder les modifications depuis l'admin
app.post('/api/save', (req, res) => {
    const { password, stats, liens } = req.body;
    
    // Vérification de sécurité intégrée au serveur
    if (password !== MOT_DE_PASSE_SECRET) {
        return res.status(403).json({ error: "Accès refusé : Mot de passe invalide." });
    }

    // Mise à jour des données en mémoire
    donneesSite.stats = stats;
    donneesSite.liens = liens;
    
    res.json({ success: true });
});

// 📁 Distribution automatique des pages HTML de ton site
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'admin.html'));
});

// Permet de charger les images (comme voila.png), le CSS ou d'autres fichiers du dossier
app.use(express.static(__dirname));

// Lancement officiel du serveur sur Render
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré avec succès sur le port ${PORT}`);
});
