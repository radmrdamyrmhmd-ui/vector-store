import { describe, expect, it } from 'vitest'
import { isValidPhone, normalizePhone, toLatinDigits } from './phone.js'

describe('server normalizePhone', () => {
  it.each([
    ['09123456789', '09123456789'],
    ['۰۹۱۲۳۴۵۶۷۸۹', '09123456789'],
    ['٠٩١٢٣٤٥٦٧٨٩', '09123456789'],
    ['9123456789', '09123456789'],
    ['+989123456789', '09123456789'],
    ['00989123456789', '09123456789'],
    ['0912 345 6789', '09123456789'],
    ['0912-345-6789', '09123456789'],
    ['(+98) 912 345 6789', '09123456789'],
  ])('turns %s into %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected)
  })

  it('returns an empty string when there is no digit', () => {
    expect(normalizePhone('')).toBe('')
    expect(normalizePhone(null)).toBe('')
    expect(normalizePhone(undefined)).toBe('')
  })
})

describe('server isValidPhone', () => {
  it.each([
    '09123456789',
    '۰۹۱۲۳۴۵۶۷۸۹',
    '9123456789',
    '+989123456789',
    '00989123456789',
    '0912 345 6789',
  ])('accepts %s', (input) => {
    expect(isValidPhone(input)).toBe(true)
  })

  it.each(['', null, undefined, '0912345678', '091234567890', '0812345678', 'abc'])(
    'rejects %s',
    (input) => {
      expect(isValidPhone(input)).toBe(false)
    }
  )
})

describe('toLatinDigits', () => {
  it('converts Persian and Arabic-Indic digits', () => {
    expect(toLatinDigits('۰۱۲۳٤٥٦')).toBe('0123456')
  })
})
