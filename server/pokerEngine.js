const { Hand } = require('pokersolver');

const SUITS = ['c', 'd', 'h', 's'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

function createDeck() {
    const deck = [];
    for (let s of SUITS) {
        for (let r of RANKS) {
            deck.push(`${r}${s}`);
        }
    }
    // Fisher-Yates Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

const BOT_NAMES = ['Bot_Maverick', 'Bot_Phil', 'Bot_Doyle', 'Bot_Negreanu', 'Bot_Ivey'];

class PokerEngine {
    constructor(io, usersDb, saveUsers) {
        this.io = io;
        this.usersDb = usersDb;
        this.saveUsers = saveUsers;
        
        this.resetTable();
        this.timeoutId = null;
    }

    resetTable() {
        this.state = {
            status: 'WAITING', // WAITING, SPINNING, PREFLOP, FLOP, TURN, RIVER, SHOWDOWN, ENDED
            buyIn: 100,
            prizePool: 0,
            multiplier: 0,
            players: [], // { id, username, isBot, chips: 1000, currentBet: 0, folded: false, allIn: false, cards: [] }
            communityCards: [],
            deck: [],
            pot: 0,
            dealerIdx: 0,
            currentTurnIdx: 0,
            highestBet: 0,
            minRaise: 20, // Big blind is 20
            smallBlind: 10,
            bigBlind: 20,
            winners: [],
            lastAction: null // string description for UI
        };
    }

    // Convert poker solving format to readable
    emitState() {
        // We must hide other players' cards, especially for real players
        // Actually, since all clients receive the same socket event, we should ideally emit specific states per player,
        // OR emit a global state where bot cards and other players' cards are hidden unless showdown.
        const globalState = {
            ...this.state,
            deck: [], // Do not send deck
            players: this.state.players.map(p => ({
                id: p.id,
                username: p.username,
                isBot: p.isBot,
                chips: p.chips,
                currentBet: p.currentBet,
                folded: p.folded,
                allIn: p.allIn,
                // Only reveal cards at showdown
                cards: (this.state.status === 'SHOWDOWN' || !p.isBot) ? p.cards : (p.folded ? [] : ['hidden', 'hidden']) 
            }))
        };
        // Broadcasst global state. 
        // Note: Real security would send specific cards to specific socket IDs, but since this is local / friends, sending all real players' cards to everyone might lead to cheating.
        // For Mario Rikart local context, we will send real player cards only to their socket.
        
        // Actually to keep it simple and secure enough:
        this.io.sockets.sockets.forEach((s) => {
            const playerState = {
                ...this.state,
                deck: [],
                players: this.state.players.map(p => ({
                    id: p.id,
                    username: p.username,
                    isBot: p.isBot,
                    chips: p.chips,
                    currentBet: p.currentBet,
                    folded: p.folded,
                    allIn: p.allIn,
                    cards: (this.state.status === 'SHOWDOWN' || p.id === s.id) ? p.cards : (p.folded ? [] : ['hidden', 'hidden'])
                }))
            };
            s.emit('poker_state', playerState);
        });
    }

    addLog(actionStr) {
        this.state.lastAction = actionStr;
    }

    joinTable(socketId, username) {
        if (this.state.status !== 'WAITING') return { error: 'Game in progress' };
        if (this.state.players.length >= 3) return { error: 'Table full' };
        if (this.state.players.find(p => p.id === socketId)) return { error: 'Already joined' };
        
        // Check balance
        const alias = username.toUpperCase();
        console.log(`[POKER] Player ${alias} joining. Db Data:`, this.usersDb[alias]);
        const playerBal = this.usersDb[alias] ? (this.usersDb[alias].balance || 0) : 0;
        
        if (!this.usersDb[alias] || playerBal < this.state.buyIn) {
            return { error: `Fonds insuffisants (${playerBal} 🟡 / ${this.state.buyIn})` };
        }

        this.state.players.push({
            id: socketId,
            username: username,
            isBot: false,
            chips: 1000, // Tournament stack
            currentBet: 0,
            folded: false,
            allIn: false,
            cards: []
        });

        this.emitState();
        return { success: true };
    }

    leaveTable(socketId) {
        if (this.state.status === 'WAITING') {
            this.state.players = this.state.players.filter(p => p.id !== socketId);
            this.emitState();
        } else {
            // Fold and mark as disconnected essentially, or process fold
            const p = this.state.players.find(p => p.id === socketId);
            if (p && !p.folded) {
                this.handleAction(socketId, 'fold');
                p.id = 'disconnected'; // Avoid further issues
            }
        }
    }

    startWithBots() {
        if (this.state.status !== 'WAITING' || this.state.players.length === 0) return;
        
        while (this.state.players.length < 3) {
            this.state.players.push({
                id: `bot_${Math.random()}`,
                username: BOT_NAMES[this.state.players.length] || 'Bot',
                isBot: true,
                chips: 1000,
                currentBet: 0,
                folded: false,
                allIn: false,
                cards: []
            });
        }

        // Deduct buy-in for real players
        let realPlayersCount = 0;
        this.state.players.forEach(p => {
            if (!p.isBot) {
                const alias = p.username.toUpperCase();
                if (this.usersDb[alias]) {
                    this.usersDb[alias].balance -= this.state.buyIn;
                    realPlayersCount++;
                }
            }
        });
        this.saveUsers();
        
        // Inform clients to sync balance
        this.io.emit('bet_resolved'); // Hack to force balance refresh on clients

        this.state.status = 'SPINNING';
        
        // Determine multiplier to match (x+1) expectation. x = number of players (3)
        // Average should be 4 * buyIn = 400. BuyIn is 100. Average multiplier = 4.
        const r = Math.random();
        let mult = 2; // 30%
        if (r > 0.3) mult = 3; // 30%
        if (r > 0.6) mult = 4; // 20%
        if (r > 0.8) mult = 6; // 10%
        if (r > 0.9) mult = 10; // 5%
        if (r > 0.95) mult = 15; // 5%

        this.state.multiplier = mult;
        this.state.prizePool = mult * this.state.buyIn;
        this.addLog(`La roue tourne... Jackpot de ${this.state.prizePool} 🟡 !`);
        
        this.emitState();

        setTimeout(() => {
            this.startNextHand();
        }, 4000);
    }

    startNextHand() {
        // Check if game over (only one player with chips)
        const activePlayers = this.state.players.filter(p => p.chips > 0);
        if (activePlayers.length === 1) {
            this.state.status = 'ENDED';
            const winner = activePlayers[0];
            this.addLog(`${winner.username} remporte le Jackpot de ${this.state.prizePool} 🟡 !`);
            this.state.winners = [winner.username];
            
            if (!winner.isBot) {
                const alias = winner.username.toUpperCase();
                if (this.usersDb[alias]) {
                    this.usersDb[alias].balance += this.state.prizePool;
                    this.saveUsers();
                    this.io.emit('bet_resolved');
                }
            }

            this.emitState();
            
            // Auto reset after 10s
            setTimeout(() => {
                this.resetTable();
                this.emitState();
            }, 10000);
            return;
        }

        // Reset pot and player states for hand
        this.state.status = 'PREFLOP';
        this.state.pot = 0;
        this.state.communityCards = [];
        this.state.highestBet = 0;
        this.state.deck = createDeck();
        this.state.winners = [];

        this.state.players.forEach(p => {
            p.currentBet = 0;
            if (p.chips > 0) {
                p.folded = false;
                p.allIn = false;
                p.cards = [this.state.deck.pop(), this.state.deck.pop()];
            } else {
                p.folded = true; // Out of tournament
                p.cards = [];
            }
        });

        // Move dealer
        do {
            this.state.dealerIdx = (this.state.dealerIdx + 1) % this.state.players.length;
        } while (this.state.players[this.state.dealerIdx].chips === 0);

        // Post blinds
        const sbIdx = this.getNextActiveIndex(this.state.dealerIdx);
        const bbIdx = this.getNextActiveIndex(sbIdx);
        
        this.bet(sbIdx, Math.min(this.state.players[sbIdx].chips, this.state.smallBlind));
        this.bet(bbIdx, Math.min(this.state.players[bbIdx].chips, this.state.bigBlind));

        this.state.currentTurnIdx = this.getNextActiveIndex(bbIdx);
        this.state.highestBet = Math.max(this.state.players[sbIdx].currentBet, this.state.players[bbIdx].currentBet);
        this.state.minRaise = this.state.bigBlind;

        this.addLog(`Nouvelle donne. Blindes posées.`);
        
        this.emitState();
        this.scheduleBotTurn();
    }

    getNextActiveIndex(currentIdx) {
        let nextIdx = currentIdx;
        let loops = 0;
        do {
            nextIdx = (nextIdx + 1) % this.state.players.length;
            loops++;
            if (loops > 10) return nextIdx; // fallback
        } while (this.state.players[nextIdx].folded || this.state.players[nextIdx].allIn || this.state.players[nextIdx].chips <= 0);
        return nextIdx;
    }

    bet(playerIdx, amount) {
        const p = this.state.players[playerIdx];
        if (amount >= p.chips) {
            amount = p.chips;
            p.allIn = true;
        }
        p.chips -= amount;
        p.currentBet += amount;
        this.state.pot += amount;
    }

    handleAction(socketId, action, amount = 0) {
        const currentPlayer = this.state.players[this.state.currentTurnIdx];
        if (currentPlayer.id !== socketId && !currentPlayer.isBot) return;

        if (action === 'fold') {
            currentPlayer.folded = true;
            this.addLog(`${currentPlayer.username} se couche.`);
        } else if (action === 'call') {
            const toCall = this.state.highestBet - currentPlayer.currentBet;
            this.bet(this.state.currentTurnIdx, toCall);
            this.addLog(`${currentPlayer.username} suit.`);
        } else if (action === 'raise') {
            const totalBet = this.state.highestBet + amount;
            const toAdd = totalBet - currentPlayer.currentBet;
            this.bet(this.state.currentTurnIdx, toAdd);
            this.state.highestBet = totalBet;
            this.state.minRaise = amount;
            this.addLog(`${currentPlayer.username} relance de ${amount}.`);
        }

        this.advanceTurn();
    }

    advanceTurn() {
        const activeCount = this.state.players.filter(p => !p.folded && p.chips > 0).length;
        const unsortFolded = this.state.players.filter(p => !p.folded);
        
        // If everyone folded except one
        if (unsortFolded.length === 1) {
            this.addLog(`${unsortFolded[0].username} gagne le pot de ${this.state.pot}`);
            unsortFolded[0].chips += this.state.pot;
            setTimeout(() => this.startNextHand(), 3000);
            this.emitState();
            return;
        }

        // Check if betting round is over
        // Round is over if all non-folded non-allIn players have bet the highestBet
        const bettingActive = this.state.players.filter(p => !p.folded && !p.allIn);
        const roundOver = bettingActive.every(p => p.currentBet === this.state.highestBet);

        if (roundOver) {
            this.nextPhase();
        } else {
            this.state.currentTurnIdx = this.getNextActiveIndex(this.state.currentTurnIdx);
            this.emitState();
            this.scheduleBotTurn();
        }
    }

    nextPhase() {
        // Reset current bets
        this.state.players.forEach(p => p.currentBet = 0);
        this.state.highestBet = 0;
        this.state.minRaise = this.state.bigBlind;

        if (this.state.status === 'PREFLOP') {
            this.state.status = 'FLOP';
            this.state.communityCards.push(this.state.deck.pop(), this.state.deck.pop(), this.state.deck.pop());
            this.addLog(`Le FLOP est dévoilé.`);
        } else if (this.state.status === 'FLOP') {
            this.state.status = 'TURN';
            this.state.communityCards.push(this.state.deck.pop());
            this.addLog(`La TURN.`);
        } else if (this.state.status === 'TURN') {
            this.state.status = 'RIVER';
            this.state.communityCards.push(this.state.deck.pop());
            this.addLog(`La RIVER.`);
        } else if (this.state.status === 'RIVER') {
            this.evaluateShowdown();
            return;
        }

        // Check if we need to showdown immediately (e.g. everyone is all-in)
        const bettingActive = this.state.players.filter(p => !p.folded && !p.allIn);
        if (bettingActive.length <= 1) {
            // Fast forward to showdown
            while (this.state.communityCards.length < 5) {
                this.state.communityCards.push(this.state.deck.pop());
            }
            this.evaluateShowdown();
            return;
        }

        this.state.currentTurnIdx = this.getNextActiveIndex(this.state.dealerIdx);
        this.emitState();
        this.scheduleBotTurn();
    }

    evaluateShowdown() {
        this.state.status = 'SHOWDOWN';
        
        const activePlayers = this.state.players.filter(p => !p.folded);
        let solvedHands = activePlayers.map(p => {
            const allCards = p.cards.concat(this.state.communityCards);
            const hand = Hand.solve(allCards);
            hand.player = p;
            return hand;
        });

        const winnersHand = Hand.winners(solvedHands); // Can be multiple if draw
        const splitPot = Math.floor(this.state.pot / winnersHand.length);
        
        let winLog = '';
        winnersHand.forEach(wh => {
            wh.player.chips += splitPot;
            winLog += `${wh.player.username} `;
            this.state.winners.push(wh.player.username);
        });

        this.addLog(`${winLog} remporte le pot avec ${winnersHand[0].descr}`);
        this.emitState();

        setTimeout(() => this.startNextHand(), 6000);
    }

    scheduleBotTurn() {
        if (this.timeoutId) clearTimeout(this.timeoutId);

        const currentPlayer = this.state.players[this.state.currentTurnIdx];
        if (currentPlayer && currentPlayer.isBot && !currentPlayer.folded && !currentPlayer.allIn) {
            // Simuler un délai de réflexion
            const delay = 1000 + Math.random() * 2000;
            this.timeoutId = setTimeout(() => {
                this.executeBotAction(currentPlayer);
            }, delay);
        }
    }

    executeBotAction(bot) {
        // Logique Extrêmement Simplifiée (Call station avec petit bluff)
        const toCall = this.state.highestBet - bot.currentBet;
        const r = Math.random();

        if (toCall === 0) {
            // Check or Raise
            if (r < 0.2) this.handleAction(bot.id, 'raise', this.state.minRaise);
            else this.handleAction(bot.id, 'call');
        } else {
            // Fold, Call or Raise
            if (toCall > bot.chips * 0.5) {
                // Large bet
                if (r < 0.1) this.handleAction(bot.id, 'call');
                else this.handleAction(bot.id, 'fold');
            } else {
                if (r < 0.2) this.handleAction(bot.id, 'fold');
                else if (r < 0.8) this.handleAction(bot.id, 'call');
                else this.handleAction(bot.id, 'raise', this.state.minRaise);
            }
        }
    }
}

module.exports = PokerEngine;
