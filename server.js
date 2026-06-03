const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Données de base
let stats = {
    followers: "150",
    likes: "10K",
    domaine: "150K",
    date_sauvegarde: "Non modifiée"
};

// 1. Les routes d'API d'abord
app.get('/api/stats', (req, res) => {
    res.json(stats);
});

app.post('/api/stats', (req, res) => {
    stats = {
        followers: req.body.followers,
        likes: req.body.likes,
        domaine: req.body.domaine,
        date_sauvegarde: req.body.date_sauvegarde
    };
    res.json({ message: "OK" });
});

// 2. Les routes spécifiques pour tes pages HTML (Chemins absolus forcés)
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'admin.html'));
});

// 3. En tout dernier, pour charger le CSS, les images, etc.
app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`Serveur en ligne sur le port ${PORT}`);
});
