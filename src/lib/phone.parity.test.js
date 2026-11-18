import { describe, expect, it } from 'vitest'
import * as client from './phone.js'
import * as server from '../../server/src/lib/phone.js'

// The browser validates for a friendly message; the API is the authority that
// accepts or rejects a number. Both must agree on every input.
const SAMPLES = [
  '09123456789',
  '۰۹۱۲۳۴۵۶۷۸۹',
  '٠٩١٢٣٤٥٦٧٨٩',
  '9123456789',
  '+989123456789',
  '00989123456789',
  '0912 345 6789',
  '0912-345-6789',
  '0912.345.6789',
  '(+98) 912 345 6789',
  ' 0912 345 6789 ',
  '',
  '   ',
  '0912345678',
  '091234567890',
  '0812345678',
  '12345678901',
  'abc',
  '0912abc4567',
  '989123456789',
]

describe('client and server phone validation agree', () => {
  it.each(SAMPLES)('isValidPhone(%j)', (input) => {
    expect(client.isValidPhone(input)).toBe(server.isValidPhone(input))
  })

  it.each(SAMPLES)('normalizePhone(%j)', (input) => {
    expect(client.normalizePhone(input)).toBe(server.normalizePhone(input))
  })

  it('handles null and undefined identically', () => {
    for (const input of [null, undefined]) {
      expect(client.isValidPhone(input)).toBe(server.isValidPhone(input))
      expect(client.normalizePhone(input)).toBe(server.normalizePhone(input))
    }
  })
})
