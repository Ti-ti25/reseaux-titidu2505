const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 1. Dit au serveur de servir tous tes fichiers (CSS, images, JS...)
app.use(express.static(__dirname));

// Données de base stockées dans la mémoire du serveur Render
let stats = {
    followers: "150",
    likes: "10K",
    domaine: "150K",
    date_sauvegarde: "Non modifiée"
};

// 2. FORCE le serveur à envoyer index.html quand on arrive sur la racine du site
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route pour envoyer les stats à la page d'accueil
app.get('/api/stats', (req, res) => {
    res.json(stats);
});

// Route pour que la page admin mette à jour les stats sur le serveur
app.post('/api/stats', (req, res) => {
    stats = {
        followers: req.body.followers,
        likes: req.body.likes,
        domaine: req.body.domaine,
        date_sauvegarde: req.body.date_sauvegarde
    };
    res.json({ message: "OK" });
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
