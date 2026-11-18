// Admin activity log. Every mutating admin request and every login attempt is
// recorded so an operator can answer "who changed what, and when".

import { query } from './db.js'

export const ROLES = ['admin', 'editor', 'viewer']

export const ROLE_LABELS = {
  admin: 'مدیر کل',
  editor: 'ویرایشگر محتوا',
  viewer: 'مشاهده‌گر',
}

const MAX_DETAIL = 1500

export async function logEvent({ req, user, action, entity, entityId, detail }) {
  try {
    const actor = user || req?.user || null
    const text =
      detail === undefined || detail === null
        ? null
        : (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, MAX_DETAIL)
    await query(
      `INSERT INTO audit_log (user_id, user_email, action, entity, entity_id, detail, ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        actor?.id || null,
        actor?.email || req?.body?.email || null,
        action,
        entity || null,
        entityId === undefined || entityId === null ? null : String(entityId),
        text,
        (req?.ip || '').slice(0, 60) || null,
      ]
    )
  } catch (error) {
    // Logging must never break the request it describes.
    console.error('[audit] could not write event', error?.message || error)
  }
}

// Express middleware: records successful mutations made through the admin panel.
export function auditMiddleware(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD') return next()
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      logEvent({
        req,
        action: 'request_failed',
        entity: req.baseUrl + req.path,
        detail: `${req.method} ${req.originalUrl} → ${res.statusCode}`,
      })
      return
    }
    logEvent({
      req,
      action: req.method === 'POST' ? 'create' : req.method === 'DELETE' ? 'delete' : 'update',
      entity: req.baseUrl + req.path,
      entityId: req.params?.id || req.params?.slug || null,
      detail: `${req.method} ${req.originalUrl}`,
    })
  })
  next()
}
