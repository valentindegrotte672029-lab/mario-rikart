import { create } from 'zustand';

const useStore = create((set) => ({
    // Identification Joueur
    username: null,
    setUsername: (name) => set({ username: name }),

    // Navigation
    currentPage: 'HOME', // HOME, LUIGI, TOAD, PEACH, MARIO, WARIO
    speedBoost: false,
    activeUsers: [],
    setActiveUsers: (users) => set({ activeUsers: users }),
    setPage: (page) => set({ currentPage: page, speedBoost: true }),
    resetSpeed: () => set({ speedBoost: false }),

    // Toad Bank State
    balance: 500000000,
    socialStatus: "PLUS DE THUNASSE QU'UN DIPLÔME DU BBA",
    lastGlitchPurchase: null, // ex: "ACHAT BLUE SHELL PRO : -99 999 999"
    spendCoins: (amount, item) => set((state) => ({
        balance: state.balance - amount,
        lastGlitchPurchase: `ACHAT ${item} : -${amount} `
    })),

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
    setLeaderboards: (leaderboards) => set({ leaderboards })
}));

export default useStore;
