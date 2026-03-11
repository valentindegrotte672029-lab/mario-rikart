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
            players: [], // { id, username, isBot, chips: 500, currentBet: 0, folded: false, allIn: false, cards: [] }
            communityCards: [],
            deck: [],
            pot: 0,
            dealerIdx: 0,
            currentTurnIdx: 0,
            highestBet: 0,
            minRaise: 50, // Big blind is 50
            smallBlind: 25,
            bigBlind: 50,
            winners: [],
            lastAction: null, // string description for UI
            handsPlayed: 0
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
                   this.resetTable();
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
            }

            this.emitState();
            
            // Auto reset after 10s
            setTimeout(() => {
                this.resetTable();
                this.emitState();
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
        if (this.state.handsPlayed > 1 && this.state.handsPlayed % 2 === 0) {
           this.state.smallBlind = Math.floor(this.state.smallBlind * 2.5);
           this.state.bigBlind = Math.floor(this.state.bigBlind * 2.5);
           this.addLog(`⚡ TURBO ! Blindes: ${this.state.smallBlind}/${this.state.bigBlind}`);
        }

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
        this.emitState();

        setTimeout(() => this.startNextHand(), 3000); // Give time to read results
    }

    scheduleBotTurn() {
        if (this.timeoutId) clearTimeout(this.timeoutId);

        const currentPlayer = this.state.players[this.state.currentTurnIdx];
        if (currentPlayer && currentPlayer.isBot && !currentPlayer.folded && !currentPlayer.allIn) {
            // Bot takes a beat to think — more natural pace
            const delay = 800 + Math.random() * 700;
            this.timeoutId = setTimeout(() => {
                this.executeBotAction(currentPlayer);
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
        } else {
            // Evaluated hand rank
            const currentHand = Hand.solve(totalCards);
            const rankNum = currentHand.rank; // 1 (High Card) to 9 (Straight Flush)
            strength = rankNum / 9;
        }

        // Pot odds variables already declared at start of method.

        // Hyper-Turbo Traits - ULTRA AGGRESSIVE
        const isAggro = Math.random() > 0.25; // 75% chance to be aggressive
        const isBluffing = Math.random() > 0.6; // 40% pure crazy bluff
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
                    // Value bet big
                    raiseAmount = Math.floor(this.state.pot * 0.8 + this.state.minRaise);
                } else if (isBluffing) {
                    // Bluff with 2-3x big blind
                    raiseAmount = this.state.minRaise * (2 + Math.floor(Math.random() * 2));
                } else {
                    // Standard bet
                    raiseAmount = this.state.minRaise + Math.floor(this.state.pot * 0.5);
                }
                this.handleAction(bot.id, 'raise', Math.min(raiseAmount, bot.chips));
            } else {
                this.handleAction(bot.id, 'call'); // Check only 10-15% of the time
            }
        } else {
            // SOMEONE HAS BET - Fold, Call, or Raise
            if (strength > 0.7 || (strength > 0.4 && isAggro)) {
                 // Re-raise with strong+ hands
                 const reraiseAmount = Math.floor(toCall * 2.5 + this.state.minRaise);
                 if (bot.chips > reraiseAmount) {
                     this.handleAction(bot.id, 'raise', reraiseAmount);
                 } else {
                     // All-in
                     this.handleAction(bot.id, 'raise', bot.chips);
                 }
            } else if (isBluffing && bot.chips > toCall * 3) {
                 // Bluff re-raise
                 this.handleAction(bot.id, 'raise', Math.floor(toCall * 2 + this.state.minRaise));
            } else if (strength > potOdds || strength > 0.25) {
                 this.handleAction(bot.id, 'call');
            } else {
                 // Only fold with truly garbage hands facing a big bet
                 if (toCall < bot.chips * 0.15) this.handleAction(bot.id, 'call');
                 else this.handleAction(bot.id, 'fold');
            }
        }
    }
}

module.exports = PokerEngine;
