import { describe, expect, it } from 'vitest'
import { DEV_ADMIN_PLACEHOLDER, isUsableAdminPassword } from './config.js'

describe('isUsableAdminPassword', () => {
  it('rejects the documented sandbox password', () => {
    expect(isUsableAdminPassword(DEV_ADMIN_PLACEHOLDER)).toBe(false)
  })

  it('rejects empty and short passwords', () => {
    expect(isUsableAdminPassword('')).toBe(false)
    expect(isUsableAdminPassword('short1234')).toBe(false)
  })

  it('accepts a long unique password', () => {
    expect(isUsableAdminPassword('N3w-Str0ng-Passw0rd-2026')).toBe(true)
  })
})
