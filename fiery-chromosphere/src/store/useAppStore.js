import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAppStore = create(
    persist(
        (set) => ({
            hasOnboarded: false,
            dopamineSaved: 0,
            targetApps: [],
            unlockedApps: {},
            dailyUsage: {},
            dailyLimit: 15,
            streak: 0,
            lastActiveDate: null,

            completeOnboarding: () => set({ hasOnboarded: true }),
            addDopamine: (amount) => set((state) => {
                const today = new Date().toISOString().split('T')[0];
                let newStreak = state.streak;

                if (state.lastActiveDate) {
                    const lastDate = new Date(state.lastActiveDate);
                    const currentDate = new Date(today);
                    const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        newStreak += 1; // Consecutive day
                    } else if (diffDays > 1) {
                        newStreak = 1; // Streak broken
                    }
                } else {
                    newStreak = 1; // First day
                }

                return {
                    dopamineSaved: state.dopamineSaved + amount,
                    streak: newStreak,
                    lastActiveDate: today
                };
            }),
            addTargetApp: (appId) => set((state) => {
                if (!state.targetApps.includes(appId)) {
                    return { targetApps: [...state.targetApps, appId] };
                }
                return state;
            }),
            removeTargetApp: (appId) => set((state) => ({
                targetApps: state.targetApps.filter(id => id !== appId)
            })),
            unlockApp: (appId, minutes) => set((state) => {
                const now = Date.now();
                const durationMs = minutes * 60 * 1000;
                const today = new Date().toISOString().split('T')[0];
                const currentUsage = state.dailyUsage[appId] || { date: today, minutes: 0 };

                let accumulatedMinutes = minutes;
                if (currentUsage.date === today) {
                    accumulatedMinutes += currentUsage.minutes;
                }

                return {
                    unlockedApps: {
                        ...state.unlockedApps,
                        [appId]: now + durationMs
                    },
                    dailyUsage: {
                        ...state.dailyUsage,
                        [appId]: { date: today, minutes: accumulatedMinutes }
                    }
                };
            }),
        }),
        {
            name: 'pushscroll-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
