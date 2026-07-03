import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      // Route `/ai/*` to the local Flask AI server so browser calls stay
      // same-origin (no CORS/preflight). `VITE_AI_SERVER_URL` is set to `/ai`
      // in .env.local; change the target to match your local Flask port.
      '/ai': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/ai/, ''),
      },
    },
  },
});
