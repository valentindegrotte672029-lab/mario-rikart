const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const PokerEngine = require('./pokerEngine');

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
// Stockage des publications BeReal
const berealsQueue = [];
// Stockage de l'historique des massages
const massagesQueue = [];

const broadcastActiveUsers = () => {
    io.emit('active_users', Object.values(players));
};

// Stockage des Meilleurs Scores par jeu
// { FLAPPYWEED: { playerName: { score: number, timestamp: string } }, CHAMPININJA: {}, DOODLEWEED: {} }
const leaderboards = {
    FLAPPYWEED: {},
    CHAMPININJA: {},
    DOODLEWEED: {}
};

// Base de données Utilisateurs (Comptes)
const USERS_FILE = path.join(__dirname, 'users.json');
let usersDb = {};
if (fs.existsSync(USERS_FILE)) {
    try {
        usersDb = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    } catch (e) {
        usersDb = {};
    }
} else {
    fs.writeFileSync(USERS_FILE, JSON.stringify({}));
}

const saveUsers = () => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersDb, null, 2));
};

// Base de données Paris (PolyMarket)
const BETS_FILE = path.join(__dirname, 'bets.json');
let betsDb = [];
if (fs.existsSync(BETS_FILE)) {
    try {
        betsDb = JSON.parse(fs.readFileSync(BETS_FILE, 'utf-8'));
    } catch (e) {
        betsDb = [];
    }
} else {
    fs.writeFileSync(BETS_FILE, JSON.stringify([]));
}

const saveBets = () => {
    fs.writeFileSync(BETS_FILE, JSON.stringify(betsDb, null, 2));
};

const pokerEngine = new PokerEngine(io, usersDb, saveUsers);

io.on('connection', (socket) => {
    console.log(`⚡ Nouvelle connexion : ${socket.id}`);

    // 0. Authentification Joueur 
    socket.on('authenticate', ({ username, password }, callback) => {
        const alias = username.toUpperCase();
        if (usersDb[alias]) {
            if (usersDb[alias].password === password) {
                callback({ 
                    success: true, 
                    isNew: false, 
                    message: "Bon retour parmi nous !",
                    userData: {
                        balance: usersDb[alias].balance || 100,
                        socialStatus: usersDb[alias].socialStatus || "PAUVRE HÈRE DU ROYAUME (RMI)"
                    }
                });
            } else {
                callback({ success: false, message: "🚨 Mot de passe incorrect." });
            }
        } else {
            // Création automatique si le pseudo n'existe pas
            usersDb[alias] = { 
                password, 
                createdAt: new Date().toISOString(),
                balance: 100,
                socialStatus: "PAUVRE HÈRE DU ROYAUME (RMI)"
            };
            saveUsers();
            callback({ 
                success: true, 
                isNew: true, 
                message: "🎉 Nouveau compte créé !",
                userData: {
                    balance: 100,
                    socialStatus: "PAUVRE HÈRE DU ROYAUME (RMI)"
                }
            });
        }
    });

    // 0.1 Sauvegarde Serveur des Données Joueur (Appelé par Zustand)
    socket.on('sync_user_data', ({ username, balance, socialStatus }) => {
        const alias = username?.toUpperCase();
        if (alias) {
            if (!usersDb[alias]) {
                // Si le serveur a redémarré et que le client a skip le login car il était déjà authentifié localement
                usersDb[alias] = {
                    createdAt: new Date().toISOString(),
                    password: '' // Connu par le client uniquement, ou perdu si memory wipe total
                };
            }
            usersDb[alias].balance = balance;
            usersDb[alias].socialStatus = socialStatus;
            saveUsers();
        }
    });

    // 0.5. Connexion de l'Admin
    socket.on('join_admin', () => {
        console.log(`👑 Admin connecté : ${socket.id}`);
        // Synchronisation des historiques de commandes (Offline)
        socket.emit('sync_orders', ordersQueue);
        socket.emit('sync_bets', betsDb);
        // On pourrait aussi sync massagesQueue si besoin
    });

    // 0.6. Requête BDD Joueurs (Admin Only)
    socket.on('get_all_users', () => {
        // Formate un tableau combinant User (Mdp) et Leaderboards
        const adminUsersList = Object.keys(usersDb).map(alias => {
            return {
                username: alias,
                password: usersDb[alias].password,
                createdAt: usersDb[alias].createdAt,
                scores: {
                    FLAPPYWEED: leaderboards.FLAPPYWEED[alias]?.score || 0,
                    CHAMPININJA: leaderboards.CHAMPININJA[alias]?.score || 0,
                    DOODLEWEED: leaderboards.DOODLEWEED[alias]?.score || 0
                }
            };
        });
        socket.emit('users_data', adminUsersList);
    });

    // 0.7 PolyMarket : Gestion des Paris
    socket.on('create_bet', (betData) => {
        const newBet = {
            id: Date.now().toString(),
            question: betData.question,
            options: betData.options,
            status: 'OPEN',
            winningOption: null,
            betsPlaced: [], // { username, optionIdx, amount }
            createdAt: new Date().toISOString()
        };
        betsDb.unshift(newBet);
        saveBets();
        io.emit('sync_bets', betsDb);
    });

    socket.on('place_bet', ({ betId, optionIdx, amount, username }) => {
        const bet = betsDb.find(b => b.id === betId);
        const alias = username.toUpperCase();
        if (bet && bet.status === 'OPEN' && usersDb[alias] && usersDb[alias].balance >= amount) {
            // Deduct balance instantly to prevent double-spending without client update, though client handles it too
            // Important: we just record it, the client already deducted its local store, 
            // but we must be sure to not deduct twice if sync_user_data runs.
            // Actually, we'll let `sync_user_data` handle the balance deduction from the client.
            // We just record the bet.
            bet.betsPlaced.push({ username: alias, optionIdx, amount });
            saveBets();
            io.emit('sync_bets', betsDb);
        }
    });

    socket.on('resolve_bet', ({ betId, winningOptionIdx }) => {
        const bet = betsDb.find(b => b.id === betId);
        if (bet && bet.status === 'OPEN') {
            bet.status = 'RESOLVED';
            bet.winningOption = winningOptionIdx;

            // Calcul du pot total
            const totalPot = bet.betsPlaced.reduce((acc, b) => acc + b.amount, 0);
            
            // Subvention du casino (+20% à +50% aléatoire)
            const casinoBonus = 1 + (Math.floor(Math.random() * 31) + 20) / 100; // 1.2 à 1.5
            const subsidizedPot = Math.floor(totalPot * casinoBonus);

            // GAGNANTS
            const winningBets = bet.betsPlaced.filter(b => b.optionIdx === winningOptionIdx);
            const totalWinningStakes = winningBets.reduce((acc, b) => acc + b.amount, 0);

            if (totalWinningStakes > 0) {
                // Redistribuer proportionnellement
                winningBets.forEach(wb => {
                    const share = wb.amount / totalWinningStakes;
                    const winnings = Math.floor(subsidizedPot * share);
                    
                    // On crédite les utilisateurs dans la DB
                    if (usersDb[wb.username]) {
                        usersDb[wb.username].balance = (usersDb[wb.username].balance || 0) + winnings;
                    }
                });
                saveUsers();
            }

            saveBets();
            io.emit('sync_bets', betsDb);
            // On force les clients gagnants à refetch leur balance (via un broadcast ciblé ou global)
            io.emit('bet_resolved', { betId, winningOptionIdx, totalPot, subsidizedPot });
        }
    });

    socket.on('delete_bet', (betId) => {
        betsDb = betsDb.filter(b => b.id !== betId);
        saveBets();
        io.emit('sync_bets', betsDb);
    });

    socket.on('request_my_balance', (username) => {
        const alias = username?.toUpperCase();
        if (alias && usersDb[alias]) {
            socket.emit('balance_update', usersDb[alias].balance);
        }
    });

    // 1. Connexion d'un joueur
    socket.on('join_game', (username) => {
        players[socket.id] = username;
        console.log(`🕹️ Joueur rejoint : ${username} (${socket.id})`);

        // Informe le Master (Admin) qu'un nouveau joueur est là
        io.emit('player_joined', { id: socket.id, username, totalPlayers: Object.keys(players).length });

        // Envoie l'historique BeReal au nouveau joueur
        socket.emit('bereals_history', berealsQueue);

        // Envoie le classement actuel au nouveau joueur
        socket.emit('leaderboards_update', leaderboards);

        // Envoie l'historique des paris
        socket.emit('sync_bets', betsDb);

        // Met à jour la liste des joueurs en ligne
        broadcastActiveUsers();
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

    // 2.2 Émission d'une commande de Massage (Peach)
    socket.on('new_massage_order', (massageData) => {
        const username = players[socket.id] || 'Anonyme';
        const completeOrder = {
            ...massageData, // { recipient, intensity }
            username,
            timestamp: new Date().toISOString(),
            id: Date.now()
        };
        console.log(`🍑 Nouvelle Commande Massage par ${username} pour ${massageData.recipient}`);
        massagesQueue.push(completeOrder);
        io.emit('massage_order_received', completeOrder);
    });

    // 2.5 Émission d'un BeReal (Mario)
    socket.on('new_bereal', (berealData) => {
        const username = players[socket.id] || 'Anonyme';
        const post = {
            ...berealData,
            username,
            timestamp: new Date().toISOString(),
            id: Date.now()
        };
        console.log(`📸 Nouveau BeReal publié par ${username}`);
        berealsQueue.unshift(post); // Ajoute au début

        // Garder les 50 derniers max pour la mémoire
        if (berealsQueue.length > 50) berealsQueue.pop();

        // Diffuse à tout le monde (Joueurs + Admin)
        io.emit('bereal_broadcast', post);
    });

    // 2.6 Suppression d'un BeReal (Admin Only)
    socket.on('delete_bereal', (postId) => {
        const index = berealsQueue.findIndex(b => b.id === postId);
        if (index !== -1) {
            console.log(`🗑️ BeReal supprimé (ID: ${postId})`);
            berealsQueue.splice(index, 1);
            // On prévient tous les clients de retirer cette image
            io.emit('bereal_deleted', postId);
        }
    });

    // 3. Diffusion d'un événement global (Envoyé par le Master "God Mode")
    socket.on('trigger_happening', (happeningType) => {
        console.log(`🚨 GOD MODE ACTIVÉ : ${happeningType} 🚨`);
        // Broadcast à TOUT LE MONDE
        io.emit('global_happening', happeningType);
    });

    // 4. Soumission d'un score de mini-jeu
    socket.on('submit_score', ({ game, score }) => {
        const username = players[socket.id] || 'Anonyme';
        if (!leaderboards[game]) leaderboards[game] = {};

        const currentBest = leaderboards[game][username]?.score || 0;

        // Seuls les meilleurs scores stricts sont gardés
        if (score > currentBest) {
            leaderboards[game][username] = {
                score,
                timestamp: new Date().toISOString()
            };
            console.log(`🏆 Nouveau record mondial pour ${username} à ${game} : ${score} pts`);

            // Broadcast the updated leaderboards to everyone
            io.emit('leaderboards_update', leaderboards);
        }
    });

    socket.on('clear_happening', () => {
        console.log(`✅ GOD MODE: Retour à la normale`);
        io.emit('global_happening', null);
    });

    // 5. Casino Poker (Texas Hold'em Twister)
    socket.on('poker_join', (username) => {
        const res = pokerEngine.joinTable(socket.id, username);
        if (res && res.error) socket.emit('poker_error', res.error);
    });

    socket.on('poker_leave', () => {
        pokerEngine.leaveTable(socket.id);
    });

    socket.on('poker_start_bots', () => {
        pokerEngine.startWithBots();
    });

    socket.on('poker_action', ({ action, amount }) => {
        pokerEngine.handleAction(socket.id, action, amount);
    });

    // Déconnexion
    socket.on('disconnect', () => {
        pokerEngine.leaveTable(socket.id);
        const username = players[socket.id];
        delete players[socket.id];
        console.log(`❌ Joueur déconnecté : ${username || socket.id}`);
        // Prévient l'admin et met à jour la liste des joueurs
        io.emit('player_left', { id: socket.id, totalPlayers: Object.keys(players).length });
        broadcastActiveUsers();
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 Serveur Mario Rikart Experience lancé sur http://localhost:${PORT}`);
});
