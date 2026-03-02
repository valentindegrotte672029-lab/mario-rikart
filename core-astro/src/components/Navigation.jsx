import React, { useState } from 'react';
import useStore from '../store/useStore';

export default function Navigation() {
    const { currentPage, setPage } = useStore();
    const [isBoosting, setIsBoosting] = useState(false);

    const handleNavigate = (page) => {
        if (page === currentPage) return;

        // On active l'effet Boost (la route va super vite)
        setPage(page);
        setIsBoosting(true);

        // Au bout de 1s, on retire le statut de boost (le nouveau composant est affiché)
        setTimeout(() => {
            useStore.getState().resetSpeed();
            setIsBoosting(false);
        }, 1200);
    };

    const pages = ['LUIGI', 'TOAD', 'PEACH', 'MARIO', 'WARIO'];

    return (
        <div className="nav-bar float-animation">
            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => handleNavigate(page)}
                    className={`nav-btn ${currentPage === page ? 'active' : ''}`}
                    disabled={isBoosting}
                >
                    {page}
                </button>
            ))}

            <style>{`
         .nav-bar {
           position: fixed;
           bottom: 30px;
           left: 50%;
           transform: translateX(-50%);
           display: flex;
           gap: 15px;
           background: rgba(0,0,0,0.6);
           padding: 15px 25px;
           border-radius: 50px;
           z-index: 100;
           border: 1px solid rgba(255,255,255,0.1);
           backdrop-filter: blur(10px);
           pointer-events: auto;
         }

         .nav-btn {
           background: transparent;
           border: 2px solid transparent;
           color: #fff;
           font-size: 1rem;
           font-weight: bold;
           cursor: pointer;
           padding: 8px 15px;
           border-radius: 20px;
           transition: all 0.3s ease;
         }

         .nav-btn:hover {
           background: rgba(255,255,255,0.1);
         }

         .nav-btn.active {
           border-color: #00ffcc;
           color: #00ffcc;
           text-shadow: 0 0 10px #00ffcc;
         }
       `}</style>
        </div>
    );
}
