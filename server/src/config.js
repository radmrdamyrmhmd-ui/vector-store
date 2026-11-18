// Deployment switches and boot-time safety checks.

export const isProduction = process.env.NODE_ENV === 'production'

// The demo build (sample content ribbon + simulated payments) is a deployment
// decision, never a code default: production stays off unless DEMO_MODE=true.
export const demoMode = process.env.DEMO_MODE === 'true' || process.env.DEMO_MODE === '1'
export const demoModeExplicit = ['true', 'false', '1', '0'].includes(process.env.DEMO_MODE || '')

// The password shipped in .env.base44-defaults for the local sandbox only.
// It must never be the admin password of a production deployment.
export const DEV_ADMIN_PLACEHOLDER = 'Hamrahan1404!'

export const MIN_ADMIN_PASSWORD = 12

export function isUsableAdminPassword(password) {
  if (!password) return false
  if (password === DEV_ADMIN_PLACEHOLDER) return false
  if (password.length < MIN_ADMIN_PASSWORD) return false
  return true
}

// Warnings only: nothing here should stop an operator from booting the API,
// but a production deployment with a guessable panel must say so in the logs.
export function checkProductionConfig() {
  const problems = []
  if (!isProduction) return problems

  if (!process.env.JWT_SECRET) {
    problems.push('JWT_SECRET is not set — sessions would reset on every restart.')
  }
  if (demoMode) {
    problems.push('DEMO_MODE is on in production — the sample-content ribbon and simulated payments are live.')
  }
  if (!process.env.ADMIN_EMAIL || !isUsableAdminPassword(process.env.ADMIN_PASSWORD || '')) {
    problems.push(
      'ADMIN_EMAIL/ADMIN_PASSWORD are missing or weak — no admin account is created or updated from the environment.'
    )
  }
  if (!/^https:/i.test(process.env.PUBLIC_BASE_URL || '')) {
    problems.push('PUBLIC_BASE_URL is not HTTPS — session cookies are sent without the Secure flag.')
  }

  for (const problem of problems) console.warn(`[config] ${problem}`)
  return problems
}
