// src/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <-- tambah Link
import { IconContext } from 'react-icons';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email dan Password tidak boleh kosong');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/');
        window.location.reload();
      } else {
        setError(data.error || 'Email atau Password salah');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Terjadi kesalahan, coba lagi');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-cyan-50 via-white to-white px-4">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent">
            Login
          </h1>
          <p className="text-gray-500 mt-2">Halaman ini khusus untuk admin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconContext.Provider value={{ className: 'h-5 w-5 text-gray-400' }}>
                  <HiOutlineMail />
                </IconContext.Provider>
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukan email"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconContext.Provider value={{ className: 'h-5 w-5 text-gray-400' }}>
                  <HiOutlineLockClosed />
                </IconContext.Provider>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukan password"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105"
          >
            Login
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center !mt-4">{error}</p>
          )}
        </form>

        {/* Jadikan link ke halaman reset */}
        <p className="text-sm text-center text-gray-600 mt-8">
          Forgot Password ?{' '}
          <Link to="/forgot-password" className="text-green-600 font-semibold hover:underline">
            Reset
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
