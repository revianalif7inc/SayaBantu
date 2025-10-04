// src/ForgotPassword.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from './lib/api';
import { IconContext } from 'react-icons';
import { HiOutlineMail, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await api.post('/auth/request-reset', { email });
      // Selalu balas generik (keamanan)
      setMsg({ kind: 'ok', text: 'Jika email terdaftar, link reset telah dikirim.' });
    } catch {
      setMsg({ kind: 'ok', text: 'Jika email terdaftar, link reset telah dikirim.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-cyan-50 via-white to-white px-4">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent">
            Reset Password
          </h1>
          <p className="text-gray-500 mt-2">Masukkan email akun Anda untuk menerima link reset.</p>
        </div>

        {/* Alert */}
        {msg && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-lg border p-3 text-sm ${
              msg.kind === 'ok'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            <IconContext.Provider value={{ className: 'h-5 w-5 mt-0.5' }}>
              {msg.kind === 'ok' ? <HiOutlineCheckCircle /> : <HiOutlineExclamationCircle />}
            </IconContext.Provider>
            <span>{msg.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={submit} className="space-y-5">
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
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105 disabled:opacity-60"
          >
            {loading ? 'Mengirim…' : 'Kirim Link Reset'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-8">
          Kembali ke{' '}
          <Link to="/login" className="font-semibold text-green-600 hover:text-green-700">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
