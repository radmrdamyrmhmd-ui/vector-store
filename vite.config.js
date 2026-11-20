import http from 'node:http'
import https from 'node:https'
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

// Crawlers that do not run JavaScript must reach the API's per-page HTML (title,
// description, canonical, Open Graph, JSON-LD). Without this the dev server would
// answer them with the bare SPA shell, which is what broke link previews on the
// public port. Production routes the same requests through the reverse proxy.
const CRAWLER =
  /(googlebot|google-inspectiontool|adsbot-google|mediapartners-google|bingbot|msnbot|yandex|duckduckbot|baiduspider|applebot|slurp|ahrefsbot|semrushbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|pinterest|skypeuripreview|embedly|vkshare|redditbot|mastodon|bluesky|iframely)/i

function crawlerProxy(target) {
  const base = new URL(target)
  const client = base.protocol === 'https:' ? https : http

  return {
    name: 'seo-crawler-proxy',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next()
        if (!CRAWLER.test(req.headers['user-agent'] || '')) return next()

        const url = req.url || '/'
        if (/^\/(api|uploads|assets|src|node_modules|@)/.test(url)) return next()
        if (url === '/sitemap.xml' || url === '/robots.txt') return next()
        // Static files (images, icons, fonts) keep being served by Vite.
        if (/\.[a-z0-9]+(\?|$)/i.test(url)) return next()

        const proxyReq = client.request(
          {
            protocol: base.protocol,
            hostname: base.hostname,
            port: base.port,
            path: url,
            method: req.method,
            headers: { ...req.headers, host: base.host },
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 502, proxyRes.headers)
            proxyRes.pipe(res)
          }
        )
        proxyReq.on('error', () => next())
        req.pipe(proxyReq)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), crawlerProxy(apiTarget)],
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
