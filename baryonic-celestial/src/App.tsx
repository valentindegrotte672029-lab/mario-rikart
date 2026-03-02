import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToadBank } from './components/ToadBank';
import { BottomNav } from './components/BottomNav';
import Garage from './pages/Garage';
import CharacterPage from './pages/CharacterPage';
import Mixer from './pages/Mixer';

const Warios = () => <div className="p-4 text-center mt-20"><h1 className="glitch-text text-xl border-b pb-2 border-[var(--coin-gold)] mb-4" data-text="WARIO'S BAR">WARIO'S BAR</h1><p>Menu items unlock here.</p></div>;
const Leaks = () => <div className="p-4 text-center mt-20"><h1 className="glitch-text text-xl border-b pb-2 border-[var(--neon-pink)] mb-4" data-text="LEAKS">LEAKS</h1><p>Social feed loading...</p></div>;

function App() {
  return (
    <Router>
      <ToadBank />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Garage />} />
          <Route path="/character/:id" element={<CharacterPage />} />
          <Route path="/mixer" element={<Mixer />} />
          <Route path="/warios" element={<Warios />} />
          <Route path="/leaks" element={<Leaks />} />
        </Routes>
      </div>
      <BottomNav />
    </Router>
  );
}

export default App;
