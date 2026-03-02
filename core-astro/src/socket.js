import { io } from 'socket.io-client';

// En production, Vercel injectera VITE_WS_URL (qui pointera vers Render)
// En dev local, on utilise l'IP locale ou le localhost
const DEV_IP = window.location.hostname;
const WS_URL = import.meta.env.VITE_WS_URL || `http://${DEV_IP}:3001`;

export const socket = io(WS_URL, {
    autoConnect: false, // On se connectera seulement quand on aura le pseudo
});
