import { useEffect } from 'react';
import useStore from '../store/useStore';

export default function useHappenings() {
    const { triggerHappening, clearHappening } = useStore();

    useEffect(() => {
        // Mock system since we don't have a backend WebSocket yet.
        // Every 30 seconds we trigger an event randomly
        const interval = setInterval(() => {
            const chance = Math.random();
            if (chance > 0.8) {
                // 20% chance to trigger something
                const type = Math.random() > 0.5 ? 'BAGARRE' : 'BRAZZERS';
                triggerHappening(type);

                // Clear after 10 seconds
                setTimeout(() => {
                    clearHappening();
                }, 10000);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [triggerHappening, clearHappening]);
}
