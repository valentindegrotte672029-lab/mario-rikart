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
    constructor(io, usersDb, saveUsers, tableId, manager) {
        this.io = io;
        this.usersDb = usersDb;
        this.saveUsers = saveUsers;
        this.tableId = tableId || 'default';
        this.manager = manager || null;
        
        this.resetTable();
        this.timeoutId = null;
        
        this.pokerStatsFile = require('path').join(__dirname, 'poker_stats.json');
        this.pokerStats = {}; // { username: { games: 0, wins: 0, totalWinnings: 0 } }
        
        const fs = require('fs');
        if (fs.existsSync(this.pokerStatsFile)) {
            try { this.pokerStats = JSON.parse(fs.readFileSync(this.pokerStatsFile, 'utf-8')); }
            catch(e) {}
        }
    }

    savePokerStats() {
        require('fs').writeFileSync(this.pokerStatsFile, JSON.stringify(this.pokerStats, null, 2));
    }

    resetTable() {
        this.state = {
            status: 'WAITING', // WAITING, SPINNING, PREFLOP, FLOP, TURN, RIVER, SHOWDOWN, ENDED
            buyIn: 100,
            prizePool: 0,
            multiplier: 0,
            players: [], // { id, username, isBot, chips: 500, ...}
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
            lastAction: null,
            handsPlayed: 0
        };
    }

    emitState() {
        // Only emit to sockets that are players in THIS table
        this.state.players.forEach(p => {
            if (p.isBot || p.id === 'disconnected') return;
            const s = this.io.sockets.sockets.get(p.id);
            if (!s) return;

            const playerState = {
                ...this.state,
                tableId: this.tableId,
                roomName: this.roomName || null,
                deck: [],
                players: this.state.players.map(pl => ({
                    id: pl.id,
                    username: pl.username,
                    isBot: pl.isBot,
                    chips: pl.chips,
                    currentBet: pl.currentBet,
                    folded: pl.folded,
                    allIn: pl.allIn,
                    cards: (this.state.status === 'SHOWDOWN' || pl.id === s.id) ? pl.cards : (pl.folded ? [] : ['hidden', 'hidden'])
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
            chips: 500, // Tournament stack - short format
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
            const pIndex = this.state.players.findIndex(p => p.id === socketId);
            if (pIndex !== -1) {
               const p = this.state.players[pIndex];
               if (!p.folded) {
                   // Force a fold action if it was their turn, otherwise just mark folded
                   if (this.state.currentTurnIdx === pIndex) {
                       this.handleAction(socketId, 'fold');
                   } else {
                       p.folded = true;
                   }
               }
               p.id = 'disconnected'; 
               p.chips = 0; // Lost their bet
               
               // Check if only bots remain
               const humans = this.state.players.filter(pl => !pl.isBot && pl.id !== 'disconnected');
               if (humans.length === 0) {
                   // End game instantly
                   if (this.timeoutId) clearTimeout(this.timeoutId);
                   if (this.manager) {
                       this.manager.onTableReset(this.tableId);
                   } else {
                       this.resetTable();
                       this.emitState();
                   }
               } else {
                   this.emitState();
               }
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
                chips: 500,
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

        // Map multiplier to wheel segment index
        // Wheel segments: [200, 300, 400, 600, 1000, 1500, 200, 300, 400, 600, 1000, 1500]
        const segmentMap = { 2: 0, 3: 1, 4: 2, 6: 3, 10: 4, 15: 5 };
        // Pick one of the two matching segments randomly
        const baseIdx = segmentMap[mult] || 0;
        const segIdx = Math.random() > 0.5 ? baseIdx : baseIdx + 6;
        // Segment center angle (conic-gradient starts from top, clockwise)
        // CSS rotate(X) CW means the segment at (360-X)° reaches the pointer
        // So to land on segment center at (segIdx*30+15)°, rotate by 360-(segIdx*30+15)
        const segCenter = segIdx * 30 + 15;
        this.state.wheelTargetAngle = 360 * 8 + (360 - segCenter);

        this.addLog(`La roue tourne... Jackpot de ${this.state.prizePool} 🟡 !`);
        
        this.emitState();

        setTimeout(() => {
            this.startNextHand();
        }, 7000);
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
                // Track tournament win in stats
                if (!this.pokerStats[winner.username]) {
                    this.pokerStats[winner.username] = { games: 0, wins: 0, totalWinnings: 0 };
                }
                this.pokerStats[winner.username].totalWinnings += this.state.prizePool;
                this.savePokerStats();
                // Broadcast updated stats
                const statsArray = Object.entries(this.pokerStats).map(([username, data]) => ({
                    username, ...data
                })).sort((a, b) => b.totalWinnings - a.totalWinnings);
                this.io.emit('poker_history', statsArray);
            }

            this.emitState();
            
            // Auto reset after delay — notify manager to clean up table
            setTimeout(() => {
                if (this.manager) {
                    this.manager.onTableReset(this.tableId);
                } else {
                    this.resetTable();
                    this.emitState();
                }
            }, 1000);
            return;
        }

        // Reset pot and player states for hand
        this.state.status = 'PREFLOP';
        this.state.pot = 0;
        this.state.communityCards = [];
        this.state.highestBet = 0;
        this.state.deck = createDeck();
        this.state.winners = [];

        this.state.handsPlayed = (this.state.handsPlayed || 0) + 1;
        // Progressive blind schedule — gentle ramp-up
        const blindSchedule = [
            [10, 20], [15, 30], [20, 40], [30, 60], 
            [50, 100], [75, 150], [100, 200], [150, 300]
        ];
        const level = Math.min(Math.floor(this.state.handsPlayed / 2), blindSchedule.length - 1);
        if (this.state.handsPlayed > 1 && this.state.handsPlayed % 2 === 0 && level > 0) {
           this.state.smallBlind = blindSchedule[level][0];
           this.state.bigBlind = blindSchedule[level][1];
           this.state.minRaise = this.state.bigBlind;
           this.addLog(`⚡ Blindes: ${this.state.smallBlind}/${this.state.bigBlind}`);
        }

        this.state.players.forEach(p => {
            p.currentBet = 0;
            p.actedThisRound = false;
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
            if (loops > this.state.players.length + 1) return currentIdx; // safety: no valid player found
        } while (
            (this.state.players[nextIdx].folded || this.state.players[nextIdx].allIn || this.state.players[nextIdx].chips <= 0) 
            && loops <= this.state.players.length + 1
        );
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
            currentPlayer.actedThisRound = true;
            this.addLog(`${currentPlayer.username} se couche.`);
        } else if (action === 'call') {
            const toCall = this.state.highestBet - currentPlayer.currentBet;
            this.bet(this.state.currentTurnIdx, toCall);
            currentPlayer.actedThisRound = true;
            this.addLog(`${currentPlayer.username} suit.`);
        } else if (action === 'raise') {
            const totalBet = this.state.highestBet + amount;
            const toAdd = totalBet - currentPlayer.currentBet;
            this.bet(this.state.currentTurnIdx, toAdd);
            this.state.highestBet = totalBet;
            this.state.minRaise = amount;
            currentPlayer.actedThisRound = true;
            // Reset actedThisRound for others (they need to respond to the raise)
            this.state.players.forEach(p => {
                if (p.id !== currentPlayer.id && !p.folded && !p.allIn) {
                    p.actedThisRound = false;
                }
            });
            this.addLog(`${currentPlayer.username} relance de ${amount}.`);
        }

        this.advanceTurn();
    }

    advanceTurn() {
        const unsortFolded = this.state.players.filter(p => !p.folded);
        
        // If everyone folded except one
        if (unsortFolded.length === 1) {
            this.addLog(`${unsortFolded[0].username} gagne le pot de ${this.state.pot}`);
            unsortFolded[0].chips += this.state.pot;
            this.state.pot = 0;
            setTimeout(() => this.startNextHand(), 3000);
            this.emitState();
            return;
        }

        // Players who can still bet (not folded, not all-in, have chips)
        const bettingActive = this.state.players.filter(p => !p.folded && !p.allIn && p.chips > 0);

        // If nobody can bet (everyone is all-in or folded), go straight to next phase
        if (bettingActive.length === 0) {
            setTimeout(() => this.nextPhase(), 1200);
            return;
        }

        // Check if betting round is over
        // Round is over if all betting-active players have ACTED and matched the highest bet
        const roundOver = bettingActive.every(p => p.actedThisRound && p.currentBet === this.state.highestBet);

        if (roundOver) {
            // Add a delay before showing next phase for readability
            setTimeout(() => this.nextPhase(), 1200);
        } else {
            // Safety against current player being invalid or unable to bet
            const nextIdx = this.getNextActiveIndex(this.state.currentTurnIdx);
            if (nextIdx === this.state.currentTurnIdx && (this.state.players[nextIdx].actedThisRound || this.state.players[nextIdx].folded || this.state.players[nextIdx].allIn)) {
                // Should not happen, but if we're looping on the same player who already played, force next phase
                setTimeout(() => this.nextPhase(), 1200);
            } else {
                this.state.currentTurnIdx = nextIdx;
                this.emitState();
                this.scheduleBotTurn();
            }
        }
    }

    nextPhase() {
        // Reset current bets and actedThisRound
        this.state.players.forEach(p => {
            p.currentBet = 0;
            p.actedThisRound = false;
        });
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
            // Dramatic staged reveal instead of instant dump
            this.stagedAllInReveal();
            return;
        }

        this.state.currentTurnIdx = this.getNextActiveIndex(this.state.dealerIdx);
        this.emitState();
        this.scheduleBotTurn();
    }

    stagedAllInReveal() {
        // Show cards face-up during all-in by switching to SHOWDOWN mode
        this.state.status = 'SHOWDOWN';
        
        const steps = [];
        const cardsNeeded = 5 - this.state.communityCards.length;
        
        if (cardsNeeded >= 3 && this.state.communityCards.length === 0) {
            // Need flop (3 cards)
            steps.push(() => {
                this.state.communityCards.push(this.state.deck.pop(), this.state.deck.pop(), this.state.deck.pop());
                this.addLog('🃏 FLOP...');
                this.emitState();
            });
        }
        
        if (this.state.communityCards.length + (steps.length > 0 ? 3 : 0) < 4) {
            // Need turn
            steps.push(() => {
                if (this.state.communityCards.length < 4) {
                    this.state.communityCards.push(this.state.deck.pop());
                }
                this.addLog('🃏 TURN...');
                this.emitState();
            });
        }
        
        if (this.state.communityCards.length + (steps.length > 0 ? 3 : 0) < 5) {
            // Need river 
            steps.push(() => {
                if (this.state.communityCards.length < 5) {
                    this.state.communityCards.push(this.state.deck.pop());
                }
                this.addLog('🃏 RIVER...');
                this.emitState();
            });
        }

        // Execute steps with delays
        let delay = 0;
        steps.forEach((step, i) => {
            delay += (i === 0) ? 500 : 1500;
            setTimeout(step, delay);
        });
        
        // Final showdown after all cards revealed
        setTimeout(() => {
            // Fill any remaining cards just in case
            while (this.state.communityCards.length < 5) {
                this.state.communityCards.push(this.state.deck.pop());
            }
            this.evaluateShowdown();
        }, delay + 2000);
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

        // Track stats for non-bot players
        const humanPlayers = this.state.players.filter(p => !p.isBot && p.id !== 'disconnected');
        const winnerNames = winnersHand.map(w => w.player.username);
        humanPlayers.forEach(p => {
            if (!this.pokerStats[p.username]) {
                this.pokerStats[p.username] = { games: 0, wins: 0, totalWinnings: 0 };
            }
            this.pokerStats[p.username].games++;
            if (winnerNames.includes(p.username)) {
                this.pokerStats[p.username].wins++;
            }
        });
        
        this.savePokerStats();

        // Auto-broadcast stats to admin
        const statsArray = Object.entries(this.pokerStats).map(([username, data]) => ({
            username, ...data
        })).sort((a, b) => b.wins - a.wins);
        this.io.emit('poker_history', statsArray);

        this.emitState();

        setTimeout(() => this.startNextHand(), 4000); // Give time to read results
    }

    scheduleBotTurn() {
        if (this.timeoutId) clearTimeout(this.timeoutId);

        const currentPlayer = this.state.players[this.state.currentTurnIdx];
        if (currentPlayer && currentPlayer.isBot && !currentPlayer.folded && !currentPlayer.allIn && currentPlayer.chips > 0) {
            // Bot takes a beat to think — natural pace
            const delay = 1200 + Math.random() * 1000;
            this.timeoutId = setTimeout(() => {
                try {
                    // Double check before execution (player could have disconnected)
                    const stillActive = this.state.players[this.state.currentTurnIdx];
                    if (stillActive && stillActive.id === currentPlayer.id && !stillActive.folded) {
                        this.executeBotAction(stillActive);
                    }
                } catch (err) {
                    console.error('Bot action error:', err.message);
                    // Fallback: just call
                    this.handleAction(currentPlayer.id, 'call');
                }
            }, delay);
        }
    }

    // Helper removed because cards are already 'Ah', 'Ts' in PokerSolver format

    executeBotAction(bot) {
        const toCall = this.state.highestBet - bot.currentBet;
        const potOdds = toCall / (this.state.pot + toCall || 1);
        
          // --- AGRESSIVE BOT LOGIC ---
        // 1. Calculate Hand Strength (0 to 1)
        // Note: The original instruction had `Hand.solve(bot.cards.map(c => this.toPokerSolverFormat(c)))`
        // for holeCards, but Hand.solve expects 5-7 cards for a full hand evaluation.
        // For pre-flop, we'll use a simpler strength calculation.
        // For post-flop, we'll use Hand.solve on all available cards.
        
        const totalCards = [...bot.cards, ...this.state.communityCards];
        let strength = 0;
        
        // Base strength on hole cards (pre-flop)
        if (this.state.communityCards.length === 0) {
            const ranks = bot.cards.map(c => '23456789TJQKA'.indexOf(c[0]));
            const isPair = ranks[0] === ranks[1];
            const hasHighCard = bot.cards.some(c => ['A', 'K', 'Q', 'J'].includes(c[0]));
            
            if (isPair) strength = ['A','K','Q','J'].includes(bot.cards[0][0]) ? 0.9 : 0.6;
            else if (hasHighCard) strength = 0.5;
            else strength = 0.2;
        } else if (totalCards.length >= 5) {
            // Evaluated hand rank
            try {
                const currentHand = Hand.solve(totalCards);
                const rankNum = currentHand.rank; // 1 (High Card) to 9 (Straight Flush)
                strength = rankNum / 9;
            } catch (e) {
                strength = 0.3; // fallback
            }
        } else {
            // Not enough cards for Hand.solve (e.g. 2 hole + < 3 community)
            const hasHighCard = bot.cards.some(c => ['A', 'K', 'Q', 'J'].includes(c[0]));
            strength = hasHighCard ? 0.45 : 0.2;
        }

        // Pot odds variables already declared at start of method.

        // Hyper-Turbo Traits - AGGRESSIVE (but less crazy)
        const isAggro = Math.random() > 0.4; // 60% chance to be aggressive
        const isBluffing = Math.random() > 0.75; // 25% pure crazy bluff
        const wantsToTrap = strength > 0.8 && Math.random() > 0.7; // Slow play strong hands sometimes

        // Decision Tree
        if (toCall === 0) {
            // NO ONE HAS BET - Bot should almost ALWAYS bet here
            if (wantsToTrap) {
                // Slow play: check with monster hand to trap
                this.handleAction(bot.id, 'call');
            } else if (strength > 0.5 || isAggro || isBluffing) {
                // Bet aggressively - pick a size based on strength
                let raiseAmount;
                if (strength > 0.7) {
                    raiseAmount = Math.floor(this.state.pot * 0.5 + this.state.minRaise);
                } else if (isBluffing) {
                    raiseAmount = this.state.minRaise;
                } else {
                    raiseAmount = this.state.minRaise + Math.floor(this.state.pot * 0.3);
                }
                const actualRaise = Math.min(raiseAmount, bot.chips);
                if (actualRaise > 0) {
                    this.handleAction(bot.id, 'raise', actualRaise);
                } else {
                    this.handleAction(bot.id, 'call');
                }
            } else {
                this.handleAction(bot.id, 'call'); // Check only 10-15% of the time
            }
        } else {
            // SOMEONE HAS BET - Fold, Call, or Raise
            if (strength > 0.7 || (strength > 0.4 && isAggro)) {
                 // Re-raise with strong+ hands
                 if (bot.chips > toCall) {
                     const maxRaise = bot.chips - toCall;
                     const desiredRaise = Math.floor(toCall * 0.5 + this.state.minRaise);
                     const actualRaise = Math.min(desiredRaise, maxRaise);
                     if (actualRaise > 0) this.handleAction(bot.id, 'raise', actualRaise);
                     else this.handleAction(bot.id, 'call');
                 } else {
                     this.handleAction(bot.id, 'call'); // all-in via call
                 }
            } else if (isBluffing && bot.chips > toCall * 3) {
                 // Bluff re-raise
                 if (bot.chips > toCall) {
                     const actualRaise = Math.min(this.state.minRaise, bot.chips - toCall);
                     if (actualRaise > 0) this.handleAction(bot.id, 'raise', actualRaise);
                     else this.handleAction(bot.id, 'call');
                 } else {
                     this.handleAction(bot.id, 'call');
                 }
            } else if (strength > potOdds || strength > 0.25) {
                 this.handleAction(bot.id, 'call');
            } else {
                 if (toCall < bot.chips * 0.15) this.handleAction(bot.id, 'call');
                 else this.handleAction(bot.id, 'fold');
            }
        }
    }
}

class PokerManager {
    constructor(io, usersDb, saveUsers) {
        this.io = io;
        this.usersDb = usersDb;
        this.saveUsers = saveUsers;
        this.tables = new Map();       // roomCode -> PokerEngine
        this.socketToTable = new Map(); // socketId -> roomCode
        this.joinRequests = new Map(); // roomCode -> [{ socketId, username }]
        this.matchQueue = [];          // [{ socketId, username }]
    }

    _generateCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code;
        do {
            code = '';
            for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
        } while (this.tables.has(code));
        return code;
    }

    createRoom(socketId, username, roomName) {
        if (this.socketToTable.has(socketId)) {
            return { error: 'Déjà assis à une table' };
        }

        const code = this._generateCode();
        const engine = new PokerEngine(this.io, this.usersDb, this.saveUsers, code, this);
        engine.creator = username;
        engine.roomName = roomName || `Salle de ${username}`;
        this.tables.set(code, engine);
        this.joinRequests.set(code, []);
        console.log(`[POKER] Salle ${code} créée par ${username}`);

        const res = engine.joinTable(socketId, username);
        if (res && res.success) {
            this.socketToTable.set(socketId, code);
            this.broadcastRooms();
            this.broadcastAdminRooms();
        }
        return { ...res, roomCode: code };
    }

    requestJoin(socketId, username, roomCode) {
        if (this.socketToTable.has(socketId)) {
            return { error: 'Déjà assis à une table' };
        }

        const code = (roomCode || '').toUpperCase().trim();
        const engine = this.tables.get(code);
        if (!engine) return { error: 'Salle introuvable' };
        if (engine.state.status !== 'WAITING') return { error: 'Partie déjà en cours' };
        if (engine.state.players.length >= 3) return { error: 'Table pleine' };

        // Check balance before requesting
        const alias = username.toUpperCase();
        const playerBal = this.usersDb[alias] ? (this.usersDb[alias].balance || 0) : 0;
        if (!this.usersDb[alias] || playerBal < 100) {
            return { error: `Fonds insuffisants (${playerBal} 🟡 / 100)` };
        }

        // Check if already requested
        const pending = this.joinRequests.get(code) || [];
        if (pending.find(r => r.socketId === socketId)) {
            return { error: 'Demande déjà envoyée' };
        }

        pending.push({ socketId, username });
        this.joinRequests.set(code, pending);

        // Notify the creator
        const creatorPlayer = engine.state.players[0]; // First player = creator
        if (creatorPlayer && !creatorPlayer.isBot) {
            const s = this.io.sockets.sockets.get(creatorPlayer.id);
            if (s) {
                s.emit('poker_join_request', { roomCode: code, username, socketId });
            }
        }

        // Notify the requester
        const requester = this.io.sockets.sockets.get(socketId);
        if (requester) requester.emit('poker_request_sent', { roomCode: code });

        this.broadcastRooms();
        return { success: true, pending: true };
    }

    approveJoin(creatorSocketId, targetSocketId, roomCode) {
        const code = (roomCode || '').toUpperCase().trim();
        const engine = this.tables.get(code);
        if (!engine) return;

        // Verify creator
        const creatorCode = this.socketToTable.get(creatorSocketId);
        if (creatorCode !== code) return;

        const pending = this.joinRequests.get(code) || [];
        const request = pending.find(r => r.socketId === targetSocketId);
        if (!request) return;

        // Remove from pending
        this.joinRequests.set(code, pending.filter(r => r.socketId !== targetSocketId));

        // Actually join
        if (engine.state.players.length >= 3 || engine.state.status !== 'WAITING') {
            const s = this.io.sockets.sockets.get(targetSocketId);
            if (s) s.emit('poker_error', 'Table pleine ou partie déjà lancée');
            return;
        }

        const res = engine.joinTable(targetSocketId, request.username);
        if (res && res.success) {
            this.socketToTable.set(targetSocketId, code);
        } else {
            const s = this.io.sockets.sockets.get(targetSocketId);
            if (s) s.emit('poker_error', res?.error || 'Erreur');
        }
        this.broadcastRooms();
        this.broadcastAdminRooms();
    }

    denyJoin(creatorSocketId, targetSocketId, roomCode) {
        const code = (roomCode || '').toUpperCase().trim();

        // Verify creator
        const creatorCode = this.socketToTable.get(creatorSocketId);
        if (creatorCode !== code) return;

        const pending = this.joinRequests.get(code) || [];
        this.joinRequests.set(code, pending.filter(r => r.socketId !== targetSocketId));

        const s = this.io.sockets.sockets.get(targetSocketId);
        if (s) s.emit('poker_join_denied', { roomCode: code });

        this.broadcastRooms();
    }

    joinRoom(socketId, username, roomCode) {
        if (this.socketToTable.has(socketId)) {
            return { error: 'Déjà assis à une table' };
        }

        const code = (roomCode || '').toUpperCase().trim();
        const engine = this.tables.get(code);
        if (!engine) return { error: 'Salle introuvable' };
        if (engine.state.status !== 'WAITING') return { error: 'Partie déjà en cours' };
        if (engine.state.players.length >= 3) return { error: 'Table pleine' };

        const res = engine.joinTable(socketId, username);
        if (res && res.success) {
            this.socketToTable.set(socketId, code);
            this.broadcastRooms();
            this.broadcastAdminRooms();
        }
        return res;
    }

    leaveTable(socketId) {
        const code = this.socketToTable.get(socketId);
        if (!code) return;

        const engine = this.tables.get(code);
        if (!engine) {
            this.socketToTable.delete(socketId);
            return;
        }

        engine.leaveTable(socketId);
        this.socketToTable.delete(socketId);

        // Send null state to the leaving player so they return to lobby
        const s = this.io.sockets.sockets.get(socketId);
        if (s) s.emit('poker_state', null);

        // Clean up if no real players left in WAITING
        if (engine.state.status === 'WAITING') {
            const realPlayers = engine.state.players.filter(p => !p.isBot && p.id !== 'disconnected');
            if (realPlayers.length === 0) {
                this.tables.delete(code);
                this.joinRequests.delete(code);
                console.log(`[POKER] Salle ${code} supprimée (vide)`);
            }
        }
        this.broadcastRooms();
        this.broadcastAdminRooms();
    }

    startWithBots(socketId) {
        const code = this.socketToTable.get(socketId);
        if (!code) return;
        const engine = this.tables.get(code);
        if (engine) {
            engine.startWithBots();
            this.broadcastRooms();
            this.broadcastAdminRooms();
        }
    }

    handleAction(socketId, action, amount) {
        const code = this.socketToTable.get(socketId);
        if (!code) return;
        const engine = this.tables.get(code);
        if (engine) engine.handleAction(socketId, action, amount);
    }

    // Called by PokerEngine when a game resets after ENDED or all humans leave
    onTableReset(tableId) {
        const engine = this.tables.get(tableId);
        if (!engine) return;

        if (engine.timeoutId) clearTimeout(engine.timeoutId);

        // Send null state to all former players (back to lobby)
        for (const [socketId, tId] of this.socketToTable) {
            if (tId === tableId) {
                this.socketToTable.delete(socketId);
                const s = this.io.sockets.sockets.get(socketId);
                if (s) s.emit('poker_state', null);
            }
        }

        // Also notify any pending requesters
        const pending = this.joinRequests.get(tableId) || [];
        pending.forEach(r => {
            const s = this.io.sockets.sockets.get(r.socketId);
            if (s) s.emit('poker_join_denied', { roomCode: tableId });
        });

        this.tables.delete(tableId);
        this.joinRequests.delete(tableId);
        console.log(`[POKER] Salle ${tableId} terminée et supprimée`);
        this.broadcastRooms();
        this.broadcastAdminRooms();
    }

    listRooms() {
        const rooms = [];
        for (const [code, engine] of this.tables) {
            if (engine.state.status === 'WAITING') {
                const pending = this.joinRequests.get(code) || [];
                rooms.push({
                    code,
                    name: engine.roomName || `Salle de ${engine.creator}`,
                    creator: engine.creator || engine.state.players[0]?.username || '?',
                    players: engine.state.players.map(p => p.username),
                    count: engine.state.players.length,
                    pendingRequests: pending.length
                });
            }
        }
        return rooms;
    }

    listAllTables() {
        const tables = [];
        for (const [code, engine] of this.tables) {
            const pending = this.joinRequests.get(code) || [];
            tables.push({
                code,
                creator: engine.creator || engine.state.players[0]?.username || '?',
                status: engine.state.status,
                players: engine.state.players.map(p => ({
                    username: p.username,
                    isBot: p.isBot,
                    chips: p.chips,
                    folded: p.folded
                })),
                count: engine.state.players.length,
                pot: engine.state.pot,
                prizePool: engine.state.prizePool,
                handsPlayed: engine.state.handsPlayed || 0,
                pendingRequests: pending.map(r => r.username)
            });
        }
        return tables;
    }

    forceDeleteTable(roomCode) {
        const code = (roomCode || '').toUpperCase().trim();
        const engine = this.tables.get(code);
        if (!engine) return;
        if (engine.timeoutId) clearTimeout(engine.timeoutId);

        for (const [socketId, tId] of this.socketToTable) {
            if (tId === code) {
                this.socketToTable.delete(socketId);
                const s = this.io.sockets.sockets.get(socketId);
                if (s) s.emit('poker_state', null);
            }
        }
        const pending = this.joinRequests.get(code) || [];
        pending.forEach(r => {
            const s = this.io.sockets.sockets.get(r.socketId);
            if (s) s.emit('poker_join_denied', { roomCode: code });
        });

        this.tables.delete(code);
        this.joinRequests.delete(code);
        console.log(`[POKER] Admin a supprimé la salle ${code}`);
        this.broadcastRooms();
        this.broadcastAdminRooms();
    }

    // ---- QUICK MATCH (Matchmaking Queue) ----
    joinQueue(socketId, username) {
        // Already in a game?
        if (this.socketToTable.has(socketId)) {
            return { error: 'Déjà assis à une table' };
        }
        // Check balance
        const alias = username.toUpperCase();
        const playerBal = this.usersDb[alias] ? (this.usersDb[alias].balance || 0) : 0;
        if (!this.usersDb[alias] || playerBal < 100) {
            return { error: `Fonds insuffisants (${playerBal} 🟡 / 100)` };
        }
        // Already in queue?
        if (this.matchQueue.find(q => q.socketId === socketId)) {
            return { error: 'Déjà en file d\'attente' };
        }
        this.matchQueue.push({ socketId, username });
        console.log(`[POKER] ${username} rejoint la queue (${this.matchQueue.length}/3)`);
        this.broadcastQueue();

        // If 3 players, create & start a match
        if (this.matchQueue.length >= 3) {
            const trio = this.matchQueue.splice(0, 3);
            this._startMatchFromQueue(trio);
        }
        return { success: true, queueSize: this.matchQueue.length };
    }

    leaveQueue(socketId) {
        this.matchQueue = this.matchQueue.filter(q => q.socketId !== socketId);
        this.broadcastQueue();
    }

    startQueueWithBots(socketId) {
        // Remove from queue
        const player = this.matchQueue.find(q => q.socketId === socketId);
        if (!player) return;
        this.matchQueue = this.matchQueue.filter(q => q.socketId !== socketId);

        // Create room, join, start with bots
        const code = this._generateCode();
        const engine = new PokerEngine(this.io, this.usersDb, this.saveUsers, code, this);
        engine.creator = player.username;
        this.tables.set(code, engine);
        this.joinRequests.set(code, []);

        const res = engine.joinTable(player.socketId, player.username);
        if (res && res.success) {
            this.socketToTable.set(player.socketId, code);
            engine.startWithBots();
        }
        this.broadcastQueue();
        this.broadcastRooms();
        this.broadcastAdminRooms();
    }

    _startMatchFromQueue(trio) {
        const code = this._generateCode();
        const engine = new PokerEngine(this.io, this.usersDb, this.saveUsers, code, this);
        engine.creator = trio[0].username;
        this.tables.set(code, engine);
        this.joinRequests.set(code, []);

        for (const p of trio) {
            const res = engine.joinTable(p.socketId, p.username);
            if (res && res.success) {
                this.socketToTable.set(p.socketId, code);
            }
        }

        console.log(`[POKER] Matchmaking: partie ${code} lancée avec ${trio.map(p => p.username).join(', ')}`);
        // Auto-start (spin the wheel)
        engine.startWithBots(); // startWithBots fills bots only if < 3, here we have 3 so no bots added
        this.broadcastQueue();
        this.broadcastRooms();
        this.broadcastAdminRooms();
    }

    broadcastQueue() {
        const data = this.matchQueue.map(q => q.username);
        // Send to each queued player
        for (const q of this.matchQueue) {
            const s = this.io.sockets.sockets.get(q.socketId);
            if (s) s.emit('poker_queue', { players: data, size: data.length });
        }
        // Also broadcast to anyone on the poker page
        this.io.emit('poker_queue_update', { players: data, size: data.length });
    }

    broadcastRooms() {
        this.io.emit('poker_rooms', this.listRooms());
    }

    broadcastAdminRooms() {
        this.io.emit('poker_admin_tables', this.listAllTables());
    }
}

module.exports = { PokerEngine, PokerManager };
