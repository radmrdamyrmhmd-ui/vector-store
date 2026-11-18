// Fixed-window rate limiting backed by Postgres.
//
// The counters live in the `rate_limits` table instead of a process-local Map,
// so the limit is shared by every API process and survives a restart. A single
// atomic upsert per request does the counting; expired windows reset in place.

import { query } from './db.js'

const MESSAGE = 'تعداد درخواست‌ها زیاد است. چند دقیقه بعد دوباره تلاش کنید.'

export async function consume(key, limit, windowMs) {
  try {
    const result = await query(
      `INSERT INTO rate_limits (key, count, window_start)
       VALUES ($1, 1, now())
       ON CONFLICT (key) DO UPDATE SET
         count = CASE
           WHEN rate_limits.window_start <= now() - ($2::int * interval '1 millisecond') THEN 1
           ELSE rate_limits.count + 1
         END,
         window_start = CASE
           WHEN rate_limits.window_start <= now() - ($2::int * interval '1 millisecond') THEN now()
           ELSE rate_limits.window_start
         END
       RETURNING count`,
      [key, windowMs]
    )
    return { allowed: Number(result.rows[0].count) <= limit, count: Number(result.rows[0].count) }
  } catch (error) {
    // A counter outage must not lock ordinary visitors out of the public forms.
    console.error('[rate-limit] counter unavailable', error?.message || error)
    return { allowed: true, count: 0 }
  }
}

/**
 * Express middleware. `key` defaults to the client IP; pass a function to
 * narrow the key (e.g. IP + email for a login attempt).
 */
export function rateLimit({ name, limit, windowMs, key, message = MESSAGE }) {
  return async (req, res, next) => {
    try {
      const identity = (key ? key(req) : req.ip) || 'unknown'
      const { allowed } = await consume(`${name}:${identity}`, limit, windowMs)
      if (!allowed) {
        res.setHeader('Retry-After', String(Math.ceil(windowMs / 1000)))
        return res.status(429).json({ error: message })
      }
      next()
    } catch (error) {
      next(error)
    }
  }
}

// Old counters are useless once their window has passed; this keeps the table small.
export async function pruneRateLimits(maxAgeMs = 24 * 60 * 60 * 1000) {
  try {
    await query(
      `DELETE FROM rate_limits WHERE window_start < now() - ($1::int * interval '1 millisecond')`,
      [maxAgeMs]
    )
  } catch (error) {
    console.error('[rate-limit] prune failed', error?.message || error)
  }
}
