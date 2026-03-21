const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { PokerManager } = require('./pokerEngine');

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

// --- BASE DE DONNÉES / PERSISTANCE ---
const loadDb = (filename, defaultVal) => {
    try {
        const filePath = path.join(__dirname, filename);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            if (content && content.trim().length > 0) {
                return JSON.parse(content);
            }
        }
    } catch (e) {
        console.error(`🚨 ERREUR CHARGEMENT DB ${filename}:`, e.message);
    }
    console.log(`ℹ️ initialisation DB ${filename} avec valeur par défaut.`);
    return defaultVal;
};

const saveDb = (filename, data) => {
    try {
        const filePath = path.join(__dirname, filename);
        const tempPath = filePath + '.tmp';
        fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
        fs.renameSync(tempPath, filePath);
    } catch (e) {
        console.error(`❌ ÉCHEC SAUVEGARDE DB ${filename}:`, e);
    }
};

// Stockage en mémoire des listes (chargées depuis le disque au démarrage)
let players = {}; // { socketId: 'Pseudo' }
let ordersQueue = loadDb('orders.json', []);
let berealsQueue = loadDb('bereals.json', []);
let massagesQueue = loadDb('massages.json', []);
let leaderboards = loadDb('leaderboards.json', { FLAPPYWEED: {}, CHAMPININJA: {}, DOODLEWEED: {} });
let usersDb = loadDb('users.json', {});
let betsDb = loadDb('bets.json', []);
let notificationsDb = loadDb('notifications.json', []);
let featureFlags = loadDb('feature_flags.json', { warioTest: true, warioCrossword: true, toadLab: true, peachasse: true, horoscope: true });
let blacklistDb = loadDb('blacklist.json', []);

// Helpers de sauvegarde
const saveUsers = () => saveDb('users.json', usersDb);
const saveBlacklist = () => saveDb('blacklist.json', blacklistDb);
const saveBets = () => saveDb('bets.json', betsDb);
const saveOrders = () => saveDb('orders.json', ordersQueue);
const saveBereals = () => saveDb('bereals.json', berealsQueue);
const saveMassages = () => saveDb('massages.json', massagesQueue);
const saveLeaderboards = () => saveDb('leaderboards.json', leaderboards);
const saveNotifications = () => saveDb('notifications.json', notificationsDb);
const saveFeatureFlags = () => saveDb('feature_flags.json', featureFlags);

const addNotification = (type, message, data = {}) => {
    const notif = { id: Date.now(), type, message, data, timestamp: new Date().toISOString(), read: false };
    notificationsDb.unshift(notif);
    if (notificationsDb.length > 100) notificationsDb.pop();
    saveNotifications();
    io.emit('admin_notification', notif);
};

const broadcastActiveUsers = () => {
    io.emit('active_users', Object.values(players));
};

const pokerManager = new PokerManager(io, usersDb, saveUsers);

io.on('connection', (socket) => {
    console.log(`⚡ Nouvelle connexion : ${socket.id}`);
    socket.emit('sync_feature_flags', featureFlags);

    const sendAllUsersToAdmin = () => {
        const adminUsersList = Object.keys(usersDb).map(alias => ({
            username: alias,
            password: usersDb[alias].password,
            createdAt: usersDb[alias].createdAt,
            balance: usersDb[alias].balance ?? 0,
            socialStatus: usersDb[alias].socialStatus || '',
            peachUnlock: usersDb[alias].peachUnlock || 'none',
            scores: {
                FLAPPYWEED: leaderboards.FLAPPYWEED[alias]?.score || 0,
                CHAMPININJA: leaderboards.CHAMPININJA[alias]?.score || 0,
                DOODLEWEED: leaderboards.DOODLEWEED[alias]?.score || 0
            }
        }));
        io.to('admin').emit('users_data', adminUsersList);
    };

    // 0. Authentification Joueur 
    socket.on('authenticate', ({ username, password }, callback) => {
        const alias = username.toUpperCase();

        // Anti-Multi-compte : Empêche deux utilisateurs d'être connectés sur le même pseudo
        if (Object.values(players).includes(alias)) {
            return callback({ success: false, message: "🚨 Ce pseudo est déjà en ligne sur un autre appareil." });
        }

        if (usersDb[alias]) {
            if (usersDb[alias].password === password) {
                players[socket.id] = alias;
                socket.join('authenticated');
                callback({ 
                    success: true, 
                    isNew: false, 
                    message: "Bon retour parmi nous !",
                    userData: {
                        balance: usersDb[alias].balance || 100,
                        socialStatus: usersDb[alias].socialStatus || "PAUVRE HÈRE DU ROYAUME (RMI)",
                        peachUnlock: usersDb[alias].peachUnlock || 'none',
                        gourdasseUnlock: usersDb[alias].gourdasseUnlock || null
                    }
                });
            } else {
                callback({ success: false, message: "🚨 Mot de passe incorrect (ou pseudo déjà pris !)" });
            }
        } else {
            // Check blacklist
            if (blacklistDb.includes(alias)) {
                return callback({ success: false, message: "🚨 Ce compte a été banni ou supprimé définitivement." });
            }
            // Temporarily store username on socket for easier kicking
            socket.username = alias;

            // Création automatique si le pseudo n'existe pas
            usersDb[alias] = { 
                password, 
                createdAt: new Date().toISOString(),
                balance: 100,
                socialStatus: "PAUVRE HÈRE DU ROYAUME (RMI)"
            };
            saveUsers();
            addNotification('USER', `🎮 Nouveau joueur : ${alias}`, { username: alias });
            sendAllUsersToAdmin(); // UPDATE ADMIN IMMEDIATELY
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
    socket.on('sync_user_data', ({ username, balance, socialStatus, peachUnlock }) => {
        const alias = username?.toUpperCase();
        if (alias && blacklistDb.includes(alias)) {
            socket.emit('account_deleted', { username: alias });
            socket.disconnect(true);
            return;
        }
        if (alias && usersDb[alias]) {
            usersDb[alias].balance = balance;
            usersDb[alias].socialStatus = socialStatus;
            usersDb[alias].peachUnlock = peachUnlock;
            saveUsers();
            // Push updated user data to admin in real-time
            io.to('admin').emit('user_updated', { username: alias, balance, socialStatus, peachUnlock, gourdasseUnlock: usersDb[alias].gourdasseUnlock });
        }
    });

    socket.on('sync_gourdasse', ({ username, gourdasseUnlock }) => {
        const alias = username?.toUpperCase();
        if (alias && usersDb[alias]) {
            usersDb[alias].gourdasseUnlock = gourdasseUnlock;
            saveUsers();
            io.to('admin').emit('user_updated', { 
                username: alias, 
                balance: usersDb[alias].balance, 
                socialStatus: usersDb[alias].socialStatus, 
                peachUnlock: usersDb[alias].peachUnlock, 
                gourdasseUnlock 
            });
        }
    });

    socket.on('update_user_balance', ({ username, newBalance }) => {
        const alias = username?.toUpperCase();
        if (alias && usersDb[alias]) {
            const oldBalance = usersDb[alias].balance;
            usersDb[alias].balance = parseInt(newBalance);
            saveUsers();
            
            // Notify admin
            io.to('admin').emit('user_updated', { 
                username: alias, 
                balance: usersDb[alias].balance, 
                socialStatus: usersDb[alias].socialStatus,
                peachUnlock: usersDb[alias].peachUnlock,
                gourdasseUnlock: usersDb[alias].gourdasseUnlock
            });

            // Notify specific user if connected
            io.emit('balance_update_forced', { username: alias, newBalance: usersDb[alias].balance });
            addNotification('ADMIN', `💰 Solde de ${alias} modifié : ${oldBalance} ➡️ ${newBalance}`);
        }
    });

    socket.on('delete_user', async ({ username }) => {
        const alias = username?.toUpperCase();
        if (alias) {
            // 1. Remove from usersDb if present
            if (usersDb[alias]) {
                delete usersDb[alias];
                saveUsers();
            }

            // 2. Add to blacklist if not already there
            if (!blacklistDb.includes(alias)) {
                blacklistDb.push(alias);
                saveBlacklist();
            }

            addNotification('ADMIN', `🗑️ Compte supprimé et banni : ${alias}`);
            sendAllUsersToAdmin(); // Refresh all admins

            // 3. Broadcast to EVERYONE to ensure the client logs itself out
            io.emit('account_deleted', { username: alias });

            // 4. Force physical kick for active instances we CAN track
            const sockets = await io.fetchSockets();
            for (const s of sockets) {
                if (s.username === alias || players[s.id] === alias) {
                    s.disconnect(true);
                }
            }
        }
    });

    // 0.5. Connexion de l'Admin
    socket.on('join_admin', () => {
        console.log(`👑 Admin connecté : ${socket.id}`);
        socket.join('admin');
        // Synchronisation de TOUTES les données persistées
        socket.emit('sync_orders', ordersQueue);
        socket.emit('sync_bets', betsDb);
        socket.emit('leaderboards_update', leaderboards);
        socket.emit('admin_notifications_history', notificationsDb);
        socket.emit('poker_admin_tables', pokerManager.listAllTables());
        socket.emit('sync_feature_flags', featureFlags);
        // Users list
        const adminUsersList = Object.keys(usersDb).map(alias => ({
            username: alias,
            password: usersDb[alias].password,
            createdAt: usersDb[alias].createdAt,
            balance: usersDb[alias].balance ?? 0,
            socialStatus: usersDb[alias].socialStatus || '',
            peachUnlock: usersDb[alias].peachUnlock || 'none',
            gourdasseUnlock: usersDb[alias].gourdasseUnlock || null,
            scores: {
                FLAPPYWEED: leaderboards.FLAPPYWEED[alias]?.score || 0,
                CHAMPININJA: leaderboards.CHAMPININJA[alias]?.score || 0,
                DOODLEWEED: leaderboards.DOODLEWEED[alias]?.score || 0
            }
        }));
        socket.emit('users_data', adminUsersList);
    });

    socket.on('get_notifications', () => {
        socket.emit('admin_notifications_history', notificationsDb);
    });

    socket.on('mark_notification_read', (notifId) => {
        const n = notificationsDb.find(x => x.id === notifId);
        if (n) { n.read = true; saveNotifications(); }
    });

    socket.on('clear_notifications', () => {
        notificationsDb = [];
        saveNotifications();
        socket.emit('admin_notifications_history', []);
    });

    socket.on('update_feature_flags', (newFlags) => {
        featureFlags = { ...featureFlags, ...newFlags };
        saveFeatureFlags();
        io.emit('sync_feature_flags', featureFlags);
    });

    socket.on('request_bereals', () => {
        socket.emit('bereals_history', berealsQueue);
    });

    socket.on('request_poker_stats', () => {
        // Read stats from a table's engine or from the stats file directly
        const statsFile = require('path').join(__dirname, 'poker_stats.json');
        let pokerStats = {};
        try { pokerStats = JSON.parse(require('fs').readFileSync(statsFile, 'utf-8')); } catch(e) {}
        const stats = Object.entries(pokerStats).map(([username, data]) => ({
            username, ...data
        })).sort((a, b) => b.wins - a.wins);
        socket.emit('poker_history', stats);
    });

    // 0.6. Requête BDD Joueurs (Admin Only)
    socket.on('get_all_users', () => {
        const adminUsersList = Object.keys(usersDb).map(alias => {
            return {
                username: alias,
                password: usersDb[alias].password,
                createdAt: usersDb[alias].createdAt,
                balance: usersDb[alias].balance ?? 0,
                socialStatus: usersDb[alias].socialStatus || '',
                peachUnlock: usersDb[alias].peachUnlock || 'none',
                gourdasseUnlock: usersDb[alias].gourdasseUnlock || null,
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
        // Removed balance check because sync_user_data may have already decremented the server balance,
        // causing a race condition where the bet is rejected but the client paid.
        if (bet && bet.status === 'OPEN' && usersDb[alias]) {
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
                        
                        // NOTIFICATION EN TEMPS RÉEL SI CONNECTÉ
                        const winnerSocketId = Object.keys(players).find(sid => players[sid] === wb.username);
                        if (winnerSocketId) {
                            io.to(winnerSocketId).emit('balance_update', usersDb[wb.username].balance);
                        }
                    }
                });
                saveUsers();
            }

            saveBets();
            io.emit('sync_bets', betsDb);
            // On force les clients à savoir que le pari est résolu
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
        const alias = username?.toUpperCase();
        if (alias && blacklistDb.includes(alias)) {
            console.log(`🚫 Tentative de connexion bloquée (Blacklist) : ${alias}`);
            socket.emit('account_deleted', { username: alias });
            socket.disconnect(true);
            return;
        }
        
        players[socket.id] = alias;
        console.log(`🕹️ Joueur rejoint : ${alias} (${socket.id})`);

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
        saveOrders();

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
        saveMassages();
        io.emit('massage_order_received', completeOrder);
    });

    // 2.3 Effacer les commandes d'un joueur
    socket.on('delete_user_orders', (usernameToDelete) => {
        ordersQueue = ordersQueue.filter(o => o.username !== usernameToDelete);
        saveOrders();
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
        saveBereals();

        // Diffuse à tout le monde (Joueurs + Admin)
        io.emit('bereal_broadcast', post);
    });

    // 2.6 Suppression d'un BeReal (Admin Only)
    socket.on('delete_bereal', (postId) => {
        const index = berealsQueue.findIndex(b => b.id === postId);
        if (index !== -1) {
            console.log(`🗑️ BeReal supprimé (ID: ${postId})`);
            berealsQueue.splice(index, 1);
            saveBereals();
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
            saveLeaderboards();
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
    socket.on('poker_create', ({ username, roomName }) => {
        const res = pokerManager.createRoom(socket.id, username, roomName);
        if (res && res.error) socket.emit('poker_error', res.error);
        else addNotification('POKER', `${username} a créé la salle "${roomName || 'Sans nom'}"`, { roomCode: res.roomCode });
    });

    socket.on('poker_join', ({ username, roomCode }) => {
        const res = pokerManager.joinRoom(socket.id, username, roomCode);
        if (res && res.error) socket.emit('poker_error', res.error);
    });

    socket.on('poker_request_join', ({ username, roomCode }) => {
        const res = pokerManager.requestJoin(socket.id, username, roomCode);
        if (res && res.error) socket.emit('poker_error', res.error);
    });

    socket.on('poker_approve_join', ({ targetSocketId, roomCode }) => {
        pokerManager.approveJoin(socket.id, targetSocketId, roomCode);
    });

    socket.on('poker_deny_join', ({ targetSocketId, roomCode }) => {
        pokerManager.denyJoin(socket.id, targetSocketId, roomCode);
    });

    socket.on('poker_list_rooms', () => {
        socket.emit('poker_rooms', pokerManager.listRooms());
    });

    socket.on('poker_admin_list', () => {
        socket.emit('poker_admin_tables', pokerManager.listAllTables());
    });

    socket.on('poker_admin_delete', (roomCode) => {
        pokerManager.forceDeleteTable(roomCode);
    });

    socket.on('poker_leave', () => {
        pokerManager.leaveTable(socket.id);
    });

    socket.on('poker_start_bots', () => {
        pokerManager.startWithBots(socket.id);
    });

    socket.on('poker_quickmatch', (username) => {
        const res = pokerManager.joinQueue(socket.id, username);
        if (res && res.error) socket.emit('poker_error', res.error);
    });

    socket.on('poker_leave_queue', () => {
        pokerManager.leaveQueue(socket.id);
    });

    socket.on('poker_queue_start_bots', () => {
        pokerManager.startQueueWithBots(socket.id);
    });

    socket.on('poker_action', ({ action, amount }) => {
        pokerManager.handleAction(socket.id, action, amount);
    });

    // 6. Peach Photo Purchase
    socket.on('peach_purchase', ({ username, level }) => {
        const cost = level === 'vip' ? 2000 : 500;
        addNotification('PEACH', `🍑 ${username} a acheté le pack ${level.toUpperCase()} (${cost} 🟡)`, { username, level, cost });
    });

    // Déconnexion
    // 10. Security: Continuous Blacklist Enforcement
    socket.onAny((event) => {
        const alias = socket.username || players[socket.id];
        if (alias && blacklistDb.includes(alias)) {
            socket.emit('account_deleted', { username: alias });
            socket.disconnect(true);
        }
    });

    socket.on('disconnect', () => {
        pokerManager.leaveQueue(socket.id);
        pokerManager.leaveTable(socket.id);
        const alias = players[socket.id];
        delete players[socket.id];
        console.log(`❌ Joueur déconnecté : ${alias || socket.id}`);
        // Prévient l'admin et met à jour la liste des joueurs
        io.emit('player_left', { id: socket.id, totalPlayers: Object.keys(players).length });
        broadcastActiveUsers();
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 Serveur Mario Rikart Experience lancé sur http://localhost:${PORT}`);
});
