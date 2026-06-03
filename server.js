const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const MOT_DE_PASSE_SECRET = "Titidu25";

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

app.get('/api/stats', (req, res) => {
    res.json(donneesSite);
});

app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === MOT_DE_PASSE_SECRET) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Mot de passe incorrect !" });
    }
});

app.post('/api/save', (req, res) => {
    const { password, stats, liens } = req.body;
    if (password !== MOT_DE_PASSE_SECRET) {
        return res.status(403).json({ error: "Mot de passe invalide." });
    }
    donneesSite.stats = stats;
    donneesSite.liens = liens;
    res.json({ success: true });
});

app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, 'index.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.resolve(__dirname, 'admin.html')));
app.get('/contact.html', (req, res) => res.sendFile(path.resolve(__dirname, 'contact.html')));

app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`🚀 Serveur en ligne sur le port ${PORT}`);
});
