// Technical details are logged only in development. Only the error type, its
// message/status and the form name are recorded — never the submitted values,
// so phone numbers, emails and message texts cannot leak into logs.
export function reportClientError(context, error) {
  if (!import.meta.env.DEV) return
  const name = error?.name || 'Error'
  const message = error?.message || String(error || '')
  const status = error?.status ?? ''
  console.error(`[${context}] ${name}${status ? ` (${status})` : ''}: ${message}`)
}
