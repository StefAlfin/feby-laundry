import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { WashingMachine, MapPin, Search, ClipboardList, Shield, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

// Pages
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import TrackPage from './pages/TrackPage';
import DashboardPage from './pages/DashboardPage';
import PromoPage from './pages/PromoPage';
import PackagePage from './pages/PackagePage';
import ContactPage from './pages/ContactPage';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error(err));

    const handleStorageChange = () => {
      const t = localStorage.getItem('token');
      setToken(t);
      if (t) {
        try {
          const payload = JSON.parse(atob(t));
          setRole(payload.role);
        } catch {
          setRole(null);
        }
      } else {
        setRole(null);
      }
    };
    
    handleStorageChange();
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleStorageChange); // custom event
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const isAdminDashboard = location.pathname === '/dashboard' && role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {!isAdminDashboard && (
        <header className="fixed top-0 inset-x-0 bg-white/90 backdrop-blur-md border-b border-slate-200/50 z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link to="/" className="flex items-center gap-2 group shrink-0">
                <div className="h-12 md:h-14 flex items-center gap-2 md:gap-3 transition-transform duration-300 group-hover:scale-105">
                  <img 
                    src="/logo.png" 
                    alt="Feby Laundry Logo" 
                    className="h-full w-auto object-contain drop-shadow-sm" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = document.getElementById('logo-icon-fallback');
                      if (fallback) {
                        fallback.classList.remove('hidden');
                        fallback.classList.add('block');
                      }
                    }}
                  />
                  <div id="logo-icon-fallback" className="hidden">
                    <div className="bg-blue-600 text-white p-2 rounded-xl">
                      <WashingMachine size={20} className="md:w-6 md:h-6" />
                    </div>
                  </div>
                  <span className="font-extrabold text-base sm:text-lg md:text-2xl text-slate-900 tracking-tight whitespace-nowrap">Feby Laundry</span>
                </div>
              </Link>
              
              {/* Desktop Nav */}
              <nav className="hidden md:flex space-x-8 items-center">
                {!token ? (
                  <Link to="/paket" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors duration-200">Paket Laundry</Link>
                ) : (
                  <Link to="/pesan" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors duration-200">Pesan</Link>
                )}
                <Link to="/promo" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors duration-200">Promo</Link>
                <Link to="/kontak" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors duration-200">Kontak</Link>
                <Link to="/dashboard" className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors duration-200 shadow-sm">
                  <User size={16} /> {token ? 'Akun' : 'Masuk'}
                </Link>
              </nav>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-100 bg-white">
              <nav className="flex flex-col px-4 py-4 space-y-4">
                {!token ? (
                  <Link to="/paket" className="font-semibold text-slate-600 hover:text-blue-600 p-2">Paket Laundry</Link>
                ) : (
                  <Link to="/pesan" className="font-semibold text-slate-600 hover:text-blue-600 p-2">Pesan</Link>
                )}
                <Link to="/promo" className="font-semibold text-slate-600 hover:text-blue-600 p-2">Promo</Link>
                <Link to="/kontak" className="font-semibold text-slate-600 hover:text-blue-600 p-2">Kontak</Link>
                <Link to="/dashboard" className="font-semibold text-white bg-blue-600 hover:bg-blue-700 p-3 rounded-xl flex justify-center items-center gap-2">
                  <User size={18} /> {token ? 'Akun Saya' : 'Masuk / Daftar'}
                </Link>
              </nav>
            </div>
          )}
        </header>
      )}

      <main className={isAdminDashboard ? "flex-grow flex w-full" : "flex-grow pt-20"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/paket" element={<PackagePage />} />
          <Route path="/pesan" element={<BookingPage />} />
          <Route path="/lacak" element={<TrackPage />} />
          <Route path="/promo" element={<PromoPage />} />
          <Route path="/kontak" element={<ContactPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>

      {!isAdminDashboard && (
        <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Feby Laundry. Bersih, Wangi, Rapi.
          </div>
        </footer>
      )}
    </div>
  );
}
