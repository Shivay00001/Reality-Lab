import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// SECURITY (wave-1, 2026-09-24): the Gemini API key is NO LONGER injected into
// the client bundle. It lives server-side in server/proxy.mjs (GEMINI_API_KEY).
// In dev, /api/* is proxied to the backend proxy on :8080.
export default defineConfig({
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
});
