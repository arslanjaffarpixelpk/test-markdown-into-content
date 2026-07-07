import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Where `/ai/*` proxies to. Override with AI_PROXY_TARGET in the environment.
  const aiTarget = env.AI_PROXY_TARGET || 'https://flask.pakistanlawbot.com';

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
      port: 5176,
      open: true,
      proxy: {
        // Route `/ai/*` to the Flask AI server so browser calls stay same-origin
        // (no CORS/preflight). `VITE_AI_SERVER_URL=/ai` in .env.local uses this.
        '/ai': {
          target: aiTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/ai/, ''),
        },
      },
    },
  };
});
