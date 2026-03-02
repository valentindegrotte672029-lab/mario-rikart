const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

// Configuration très large pour le CORS en dev, permettant aux apps Vue/React de se connecter
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Stockage en mémoire des joueurs connectés
// Structure: { socketId: 'Pseudo' }
const players = {};
// Stockage de l'historique des commandes (optionnel pour l'instant)
const ordersQueue = [];

io.on('connection', (socket) => {
    console.log(`⚡ Nouvelle connexion : ${socket.id}`);

    // 1. Connexion d'un joueur
    socket.on('join_game', (username) => {
        players[socket.id] = username;
        console.log(`🕹️ Joueur rejoint : ${username} (${socket.id})`);

        // Informe le Master (Admin) qu'un nouveau joueur est là
        io.emit('player_joined', { id: socket.id, username, totalPlayers: Object.keys(players).length });
    });

    // 2. Émission d'une commande (Wario Bar)
    socket.on('new_order', (orderData) => {
        const username = players[socket.id] || 'Anonyme';
        const completeOrder = {
            ...orderData,
            username,
            timestamp: new Date().toISOString()
        };
        console.log(`🛍️ Nouvelle Commande par ${username} : ${orderData.item}`);
        ordersQueue.push(completeOrder);

        // On relaie la commande UNIQUEMENT à l'admin (les autres joueurs s'en fichent)
        io.emit('order_received', completeOrder);
    });

    // 3. Diffusion d'un événement global (Envoyé par le Master "God Mode")
    socket.on('trigger_happening', (happeningType) => {
        console.log(`🚨 GOD MODE ACTIVÉ : ${happeningType} 🚨`);
        // Broadcast à TOUT LE MONDE
        io.emit('global_happening', happeningType);
    });

    socket.on('clear_happening', () => {
        console.log(`✅ GOD MODE: Retour à la normale`);
        io.emit('global_happening', null);
    });

    // Déconnexion
    socket.on('disconnect', () => {
        const username = players[socket.id];
        if (username) {
            console.log(`👋 Joueur parti : ${username}`);
            delete players[socket.id];
            io.emit('player_left', { id: socket.id, username, totalPlayers: Object.keys(players).length });
        }
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 Serveur Mario Rikart Experience lancé sur http://localhost:${PORT}`);
});
