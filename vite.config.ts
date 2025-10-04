import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Ambil ENV Vite (semua yang diawali VITE_)
  const env = loadEnv(mode, process.cwd(), '');
  const API_TARGET = env.VITE_API_BASE || 'http://localhost:5000';

  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@': '/src',
      },
    },

    // Dev server
    server: {
      port: 5173,
      open: true,
      strictPort: true,
      proxy: {
        // forward ke backend; pilih mana yang kamu pakai
        '/api':     { target: API_TARGET, changeOrigin: true },
        '/users':   { target: API_TARGET, changeOrigin: true },
        '/auth':    { target: API_TARGET, changeOrigin: true },
        '/uploads': { target: API_TARGET, changeOrigin: true },
      },
    },

    // Preview (npm run preview) – ikut proxy juga
    preview: {
      port: 5173,
      proxy: {
        '/api':     { target: API_TARGET, changeOrigin: true },
        '/users':   { target: API_TARGET, changeOrigin: true },
        '/auth':    { target: API_TARGET, changeOrigin: true },
        '/uploads': { target: API_TARGET, changeOrigin: true },
      },
    },

    optimizeDeps: {
      // lucide-react kadang error saat pre-bundle; exclude aman
      exclude: ['lucide-react'],
    },

    build: {
      outDir: 'dist',
      target: 'es2019',
      sourcemap: true,
    },
  };
});
