import { create } from 'zustand';

const useStore = create((set) => ({
    // Identification Joueur
    username: null,
    setUsername: (name) => set({ username: name }),

    // Navigation
    currentPage: 'HOME', // HOME, LUIGI, TOAD, PEACH, MARIO, WARIO
    speedBoost: false,
    setPage: (page) => set({ currentPage: page, speedBoost: true }),
    resetSpeed: () => set({ speedBoost: false }),

    // Toad Bank State
    balance: 100, // Solde réduit pour donner un intérêt au Mini-Jeu
    socialStatus: "PAUVRE COMME UN BBA",
    lastGlitchPurchase: null, // ex: "ACHAT BLUE SHELL PRO : -99 999 999"
    spendCoins: (amount, item) => set((state) => ({
        balance: state.balance - amount,
        lastGlitchPurchase: `ACHAT ${item} : -${amount} `
    })),
    addCoins: (amount) => set((state) => {
        const newBalance = state.balance + amount;
        let newStatus = "PAUVRE COMME UN BBA";
        if (newBalance > 500) newStatus = "CLASSE MOYENNE SUPÉRIEURE";
        if (newBalance > 5000) newStatus = "RICHE HÉRITIER";

        return {
            balance: newBalance,
            socialStatus: newStatus,
            lastGlitchPurchase: `GAIN CASH MACHINE : +${amount} 🟡`
        };
    }),

    // Happenings (Global Events)
    happening: null, // 'BAGARRE', 'BRAZZERS', ou null
    triggerHappening: (event) => set({ happening: event }),
    clearHappening: () => set({ happening: null }),
}));

export default useStore;
