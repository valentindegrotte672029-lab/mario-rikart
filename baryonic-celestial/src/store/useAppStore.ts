import { create } from 'zustand';

interface UserState {
  coins: number;
  sobriety: number;
  inventory: string[];
  addCoins: (amount: number) => void;
  removeCoins: (amount: number) => boolean;
  setSobriety: (level: number) => void;
  addToInventory: (item: string) => void;
}

export const useAppStore = create<UserState>((set, get) => ({
  coins: 500000000, // Starting amount specified
  sobriety: 100, // 0 to 100
  inventory: [],
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
  removeCoins: (amount) => {
    const { coins } = get();
    if (coins >= amount) {
      set({ coins: coins - amount });
      return true;
    }
    return false;
  },
  setSobriety: (level) => set({ sobriety: Math.max(0, Math.min(100, level)) }),
  addToInventory: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
}));
