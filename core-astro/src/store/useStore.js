import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
    persist(
        (set) => ({
    // Identification Joueur
    username: null,
    setUsername: (name) => set({ username: name }),
    setLoginData: (name, balance, socialStatus) => set({ username: name, balance, socialStatus }),
    logout: () => set({ username: null, balance: 100, socialStatus: "PAUVRE HÈRE DU ROYAUME (RMI)" }),

    // Navigation
    currentPage: 'MARIO', // LUIGI, TOAD, PEACH, MARIO, WARIO, etc.
    speedBoost: false,
    activeUsers: [],
    setActiveUsers: (users) => set({ activeUsers: users }),
    setPage: (page) => set({ currentPage: page, speedBoost: true, bgOverride: null }),
    resetSpeed: () => set({ speedBoost: false }),

    // Background override (set by subpages like Casino/Psych to crossfade full-screen bg)
    bgOverride: null,
    setBgOverride: (theme) => set({ bgOverride: theme }),
    clearBgOverride: () => set({ bgOverride: null }),

    // Toad Bank State
    balance: 100,
    socialStatus: "PAUVRE HÈRE DU ROYAUME (RMI)",
    lastGlitchPurchase: null, // ex: "ACHAT BLUE SHELL PRO : -99 999 999"
    errorMsg: null,
    spendCoins: (amount, item) => {
        const state = set; // Reference to get
        const currentState = useStore.getState();

        if (currentState.balance < amount) {
            set({ errorMsg: `Tu n'as pas assez de pièces pour payer ${item} ! Joues à des mini-jeux pour gagner plus de pièces.` });
            setTimeout(() => set({ errorMsg: null }), 5000);
            return false;
        }

        set((s) => ({
            balance: s.balance - amount,
            lastGlitchPurchase: `ACHAT ${item} : -${amount} `
        }));
        setTimeout(() => set({ lastGlitchPurchase: null }), 2000);
        return true;
    },

    // Happenings (Global Events)
    happening: null, // 'BAGARRE', 'BRAZZERS', ou null
    triggerHappening: (event) => set({ happening: event }),
    clearHappening: () => set({ happening: null }),

    // BeReal Feed
    bereals: [],
    setBereals: (bereals) => set({ bereals }),
    addBereal: (bereal) => set((state) => ({ bereals: [bereal, ...state.bereals] })),
    deleteBereal: (id) => set((state) => ({ bereals: state.bereals.filter(b => b.id !== id) })),

    // Leaderboards
    leaderboards: { FLAPPYWEED: {}, CHAMPININJA: {}, DOODLEWEED: {} },
    setLeaderboards: (leaderboards) => set({ leaderboards }),

    // PolyMarket (Bets)
    bets: [],
    setBets: (bets) => set({ bets }),

    // Poker State
    pokerState: null,
    setPokerState: (pokerState) => set({ pokerState }),
    pokerRooms: [],
    setPokerRooms: (pokerRooms) => set({ pokerRooms }),
    pokerQueue: null,
    setPokerQueue: (pokerQueue) => set({ pokerQueue }),
    pendingJoinRequest: false,
    setPendingJoinRequest: (v) => set({ pendingJoinRequest: v }),
    joinRequests: [],
    addJoinRequest: (req) => set(s => ({ joinRequests: [...s.joinRequests, req] })),
    removeJoinRequest: (socketId) => set(s => ({ joinRequests: s.joinRequests.filter(r => r.socketId !== socketId) })),
    clearJoinRequests: () => set({ joinRequests: [] }),

    // Peach unlock state: 'none' | 'basic' | 'vip'
    peachUnlock: 'none',
    setPeachUnlock: (level) => set({ peachUnlock: level }),

    setBalance: (balance) => set({ balance })
    }),
    {
        name: 'mario-rikart-storage',
        // On ne sauvegarde que les éléments clés (pseudo, argent, statut social)
        partialize: (state) => ({ 
            username: state.username, 
            balance: state.balance, 
            socialStatus: state.socialStatus,
            peachUnlock: state.peachUnlock 
        }),
    }
));

export default useStore;
