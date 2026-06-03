const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Stockage temporaire en mémoire
let donnéesSite = {
    stats: {
        followers: "150",
        likes: "10K",
        domaine: "150K",
        date_sauvegarde: "Non modifiée"
    },
    liens: [
        { id: 1, texte: "Mon TikTok", url: "https://www.tiktok.com" },
        { id: 2, texte: "Mon YouTube", url: "https://www.youtube.com" },
        { id: 3, texte: "Mon GitHub", url: "https://github.com" }
    ]
};

// Route API unique pour TOUT récupérer d'un coup
app.get('/api/data', (req, res) => {
    res.json(donnéesSite);
});

// Route API pour TOUT sauvegarder d'un coup (stats + ordre des boutons)
app.post('/api/data', (req, res) => {
    donnéesSite = {
        stats: req.body.stats,
        liens: req.body.liens
    };
    res.json({ message: "OK" });
});

// Forcer l'affichage des pages HTML
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'admin.html'));
});

app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`Serveur en ligne sur le port ${PORT}`);
});
