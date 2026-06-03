const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Définis ton mot de passe secret ici (tu peux le changer)
const MOT_DE_PASSE_SECRET = "Titidu25";

// Stockage initial des données avec ton design d'origine
let donnéesSite = {
    stats: {
        followers: "150",
        likes: "10K",
        domaine: "150K",
        date_sauvegarde: "Aucune sauvegarde détectée"
    },
    liens: [
        { texte: "🚀 Rejoins mon serveur Discord !", url: "https://discord.com/invite/V4YMKzWYEM" },
        { texte: "📺 Ma chaîne YouTube", url: "https://youtube.com/" },
        { texte: "📸 Mon Instagram", url: "https://instagram.com/ton_pseudo" },
        { texte: "📩 Contact Pro / Partenariats", url: "mailto:ton.email.pro@email.com" }
    ]
};

// Route pour envoyer les données au site public (sans mot de passe)
app.get('/api/data', (req, res) => {
    res.json(donnéesSite);
});

// Route de vérification du mot de passe (quand on se connecte au panel)
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === MOT_DE_PASSE_SECRET) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Mot de passe incorrect !" });
    }
});

// Route sécurisée pour sauvegarder les modifications
app.post('/api/data', (req, res) => {
    const { password, stats, liens } = req.body;
    
    if (password !== MOT_DE_PASSE_SECRET) {
        return res.status(403).json({ error: "Accès refusé : Mot de passe invalide." });
    }

    donnéesSite = { stats, liens };
    res.json({ message: "OK" });
});

// Redirection vers les fichiers HTML
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'admin.html'));
});

app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`Serveur actif sur le port ${PORT}`);
});
