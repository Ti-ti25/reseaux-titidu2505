const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Permet de lire les formulaires classiques si besoin
app.use(express.urlencoded({ extended: true })); 

const MOT_DE_PASSE_SECRET = "Tristan2026";

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

// Route pour l'index
app.get('/api/stats', (req, res) => {
    res.json(donneesSite);
});

// Connexion Admin
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === MOT_DE_PASSE_SECRET) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Mot de passe incorrect !" });
    }
});

// Sauvegarde Admin
app.post('/api/save', (req, res) => {
    const { password, stats, liens } = req.body;
    if (password !== MOT_DE_PASSE_SECRET) {
        return res.status(403).json({ error: "Mot de passe invalide." });
    }
    donneesSite.stats = stats;
    donneesSite.liens = liens;
    res.json({ success: true });
});

// 📩 NOUVELLE ROUTE : Reçoit les messages du formulaire de contact
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    // Ici, le serveur reçoit les données. On affiche le message dans la console Render
    console.log(`📩 Nouveau message de de ${name} (${email}) : ${message}`);
    
    // On répond au navigateur que tout est OK
    res.json({ success: true, message: "Message reçu avec succès !" });
});

// Pages HTML
app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, 'index.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.resolve(__dirname, 'admin.html')));
app.get('/contact.html', (req, res) => res.sendFile(path.resolve(__dirname, 'contact.html')));

app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`🚀 Serveur en ligne sur le port ${PORT}`);
});
