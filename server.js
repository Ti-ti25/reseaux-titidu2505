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

// Route principale (DOIT ÊTRE PLACÉE AVANT LE STATIC)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Routes API
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

// En dernier : service des fichiers statiques (CSS, images...)
app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`Serveur en ligne sur le port ${PORT}`);
});
