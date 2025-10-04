import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from './lib/api';  // Sesuaikan dengan API Anda
import { IconContext } from 'react-icons';
import { HiOutlineLockClosed, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi';

const ResetPassword: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (!token) setMsg({ kind: 'err', text: 'Token tidak ditemukan.' });
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!token) return;
    if (password.length < 6) return setMsg({ kind: 'err', text: 'Password minimal 6 karakter.' });
    if (password !== confirm) return setMsg({ kind: 'err', text: 'Konfirmasi password tidak sama.' });

    try {
      setLoading(true);
      await api.post('http://localhost:5000/auth/reset-password', { token, password });  // Pastikan URL sesuai dengan backend
      setMsg({ kind: 'ok', text: 'Password berhasil diubah. Mengalihkan ke login…' });
      setTimeout(() => nav('/login'), 1200);
    } catch (e: any) {
      setMsg({ kind: 'err', text: e?.response?.data?.error || 'Token invalid atau kedaluwarsa.' });
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
          <p className="text-gray-500 mt-2">Masukkan password baru Anda</p>
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
          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password baru
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconContext.Provider value={{ className: 'h-5 w-5 text-gray-400' }}>
                  <HiOutlineLockClosed />
                </IconContext.Provider>
              </div>
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                disabled={!token}
                className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition disabled:bg-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 text-sm text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPwd ? 'Sembunyikan' : 'Tampilkan'}
              </button>
            </div>
          </div>

          {/* Confirm */}
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
              Konfirmasi password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconContext.Provider value={{ className: 'h-5 w-5 text-gray-400' }}>
                  <HiOutlineLockClosed />
                </IconContext.Provider>
              </div>
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Ulangi password baru"
                disabled={!token}
                className="w-full pl-10 pr-24 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition disabled:bg-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 text-sm text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showConfirm ? 'Sembunyikan' : 'Tampilkan'}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!token || loading}
            className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105 disabled:opacity-60"
          >
            {loading ? 'Menyimpan…' : 'Simpan Password'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-center text-gray-600 mt-8">
          Sudah ingat password?{' '}
          <Link to="/login" className="font-semibold text-green-600 hover:text-green-700">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
