import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
    persist(
        (set) => ({
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
    }),
    {
        name: 'mario-rikart-storage',
        // On ne sauvegarde que les éléments clés (pseudo, argent, statut social)
        partialize: (state) => ({ 
            username: state.username, 
            balance: state.balance, 
            socialStatus: state.socialStatus 
        }),
    }
));

export default useStore;
