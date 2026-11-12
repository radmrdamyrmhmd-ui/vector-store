import fs from 'node:fs'
import express from 'express'
import cookieParser from 'cookie-parser'
import { initDb } from './db.js'
import publicRoutes from './routes/public.js'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'

const app = express()
const port = Number(process.env.PORT || 8000)
const uploadDir = process.env.UPLOAD_DIR || '/app/uploads'

fs.mkdirSync(uploadDir, { recursive: true })

app.set('trust proxy', 1)
app.disable('x-powered-by')
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.use(
  '/uploads',
  express.static(uploadDir, {
    maxAge: '7d',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff')
    },
  })
)

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api', publicRoutes)

app.use((_req, res) => {
  res.status(404).json({ error: 'مسیر موردنظر پیدا نشد.' })
})

app.use((error, _req, res, _next) => {
  console.error('[api] unhandled error', error)
  res.status(error.status || 500).json({ error: 'خطای غیرمنتظره در سرور رخ داد. لطفاً دوباره تلاش کنید.' })
})

initDb()
  .then(() => {
    app.listen(port, '0.0.0.0', () => {
      console.log(`[api] listening on 0.0.0.0:${port}`)
    })
  })
  .catch((error) => {
    console.error('[api] database initialisation failed', error)
    process.exit(1)
  })
