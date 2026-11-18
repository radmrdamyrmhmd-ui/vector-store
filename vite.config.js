import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In the sandbox the API runs as a sibling compose service; locally it defaults to localhost.
const apiTarget = process.env.API_PROXY_TARGET || 'http://127.0.0.1:8000'
const previewMode = process.env.BASE44_PREVIEW_MODE === '1'
const sandboxDomain = process.env.BASE44_SANDBOX_HOST_DOMAIN || ''

// The preview proxy reaches the dev server through a sandbox host that changes on every
// rebuild, so the allowlist is extended with the sandbox domain wildcard in preview mode only.
const allowedHosts = [
  'localhost',
  '127.0.0.1',
  ...(previewMode && sandboxDomain ? [sandboxDomain, `.${sandboxDomain}`] : []),
]

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts,
    watch: { usePolling: true, interval: 400 },
    // `xfwd` forwards the visitor's address, so per-IP rate limits on the API
    // count each visitor instead of the dev-server proxy as one client.
    proxy: {
      '/api': { target: apiTarget, changeOrigin: false, xfwd: true },
      '/uploads': { target: apiTarget, changeOrigin: false },
      // SEO files are generated from the database by the API.
      '/sitemap.xml': { target: apiTarget, changeOrigin: false },
      '/robots.txt': { target: apiTarget, changeOrigin: false },
    },
  },
})
