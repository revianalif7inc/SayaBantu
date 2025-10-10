// components/Header.tsx
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function parseJwt(token: string | null): any | null {
  if (!token) return null;
  try {
    const base64 = token.split('.')[1];
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

const API_BASE = 'http://localhost:5000';
const cdn = (u?: string) => (u ? (u.startsWith('/uploads') ? `${API_BASE}${u}` : u) : '');

const normalizeWa = (n: string) => {
  const d = (n || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('62')) return d;
  if (d.startsWith('0')) return '62' + d.slice(1);
  if (d.startsWith('8')) return '62' + d;
  return d;
};

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const [logoUrl, setLogoUrl] = useState<string>('');
  const [waNumber, setWaNumber] = useState<string>('');
  const [waMessage, setWaMessage] = useState<string>('Halo, saya butuh bantuan'); // ✅ default fallback

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    const payload = parseJwt(token);
    setRole(payload?.role ?? null);
  }, []);

  // ✅ Ambil logo, nomor WA, dan pesan WA dari database
  useEffect(() => {
    const fetchPublic = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/public/site`);
        setLogoUrl(cdn(data?.logo_url));
        setWaNumber(data?.whatsapp_number || '');
        setWaMessage(data?.whatsapp_message ?? 'Halo, saya butuh bantuan');
      } catch (e) {
        console.error('Gagal mengambil data public/site:', e);
      }
    };
    fetchPublic();
  }, []);

  const scrollToSection = (id: string) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const handleLoginLogout = () => {
    if (isLoggedIn) {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setRole(null);
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  // ✅ Gunakan waMessage dari database
  const waIntl = normalizeWa(waNumber);
  const waHref = waIntl
    ? `https://wa.me/${waIntl}?text=${encodeURIComponent(waMessage)}`
    : '#';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-white/90 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Brand */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-9 md:h-10 object-contain"
                loading="eager"
              />
            ) : (
              <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold text-xl px-3 py-2 rounded-lg">
                SayaBantu
              </div>
            )}
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-blue-600 font-medium">Tentang</button>
            <button onClick={() => scrollToSection('services')} className="text-gray-700 hover:text-blue-600 font-medium">Layanan</button>
            <button onClick={() => scrollToSection('why-choose')} className="text-gray-700 hover:text-blue-600 font-medium">Keunggulan</button>
            <button onClick={() => scrollToSection('testimonials')} className="text-gray-700 hover:text-blue-600 font-medium">Testimoni</button>
            {isLoggedIn && role === 'admin' && (
              <button onClick={() => navigate('/settings')} className="text-gray-700 hover:text-blue-600 font-medium">
                Settings
              </button>
            )}
          </nav>

          {/* Aksi kanan */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg"
            >
              Hubungi Kami
            </a>
            <button
              onClick={handleLoginLogout}
              className="text-white bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 rounded-full font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300"
            >
              {isLoggedIn ? 'Logout' : 'Login'}
            </button>
          </div>

          {/* Mobile button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-700">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 mt-4">
            <div className="flex flex-col space-y-4 pt-4">
              <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-blue-600 text-left font-medium">Tentang</button>
              <button onClick={() => scrollToSection('services')} className="text-gray-700 hover:text-blue-600 text-left font-medium">Layanan</button>
              <button onClick={() => scrollToSection('why-choose')} className="text-gray-700 hover:text-blue-600 text-left font-medium">Keunggulan</button>
              <button onClick={() => scrollToSection('testimonials')} className="text-gray-700 hover:text-blue-600 text-left font-medium">Testimoni</button>

              {isLoggedIn && role === 'admin' && (
                <button
                  onClick={() => { setIsOpen(false); navigate('/settings'); }}
                  className="text-gray-700 hover:text-blue-600 text-left font-medium"
                >
                  Settings
                </button>
              )}

              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full font-medium text-center hover:from-green-600 hover:to-green-700 transition-all duration-300"
              >
                Hubungi Kami
              </a>
              <button
                onClick={handleLoginLogout}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full font-medium text-center hover:from-green-600 hover:to-green-700 transition-all duration-300"
              >
                {isLoggedIn ? 'Logout' : 'Login'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
