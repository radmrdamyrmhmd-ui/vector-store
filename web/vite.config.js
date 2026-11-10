import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Preview-only host allowance: the sandbox serves the dev server through a
// proxy whose Host header carries a rotating sandbox id. Gated so a normal
// `npm run dev` keeps Vite's default behaviour.
const previewMode = process.env.BASE44_PREVIEW_MODE === '1';
const sandboxDomain = process.env.BASE44_SANDBOX_HOST_DOMAIN;

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: previewMode && sandboxDomain ? [`.${sandboxDomain}`, '.localhost', 'localhost'] : true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
    watch: { usePolling: previewMode, interval: 250 },
  },
});
