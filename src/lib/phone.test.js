import { describe, expect, it } from 'vitest'
import { isValidPhone, normalizePhone, phoneInputValue } from './phone.js'

describe('normalizePhone', () => {
  it.each([
    ['09123456789', '09123456789'],
    ['۰۹۱۲۳۴۵۶۷۸۹', '09123456789'],
    ['9123456789', '09123456789'],
    ['+989123456789', '09123456789'],
    ['00989123456789', '09123456789'],
    ['0912 345 6789', '09123456789'],
    ['0912-345-6789', '09123456789'],
    ['0912.345.6789', '09123456789'],
    ['(+98) 912 345 6789', '09123456789'],
    [' 0912 345 6789 ', '09123456789'],
  ])('turns %s into %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected)
  })

  it('returns an empty string when there is no digit', () => {
    expect(normalizePhone('')).toBe('')
    expect(normalizePhone('   ')).toBe('')
    expect(normalizePhone(null)).toBe('')
    expect(normalizePhone(undefined)).toBe('')
  })
})

describe('isValidPhone', () => {
  it.each([
    '09123456789',
    '۰۹۱۲۳۴۵۶۷۸۹',
    '9123456789',
    '+989123456789',
    '00989123456789',
    '۰۹۱۲ ۳۴۵ ۶۷۸۹',
    '0912-345-6789',
    '09901234567',
    '09011234567',
  ])('accepts %s', (input) => {
    expect(isValidPhone(input)).toBe(true)
  })

  it.each([
    '',
    '   ',
    null,
    undefined,
    '0912345678', // one digit short
    '091234567890', // one digit too long
    '0812345678', // no mobile prefix
    '12345678901',
    'abc',
    '0912abc4567',
    '0912345678x',
  ])('rejects %s', (input) => {
    expect(isValidPhone(input)).toBe(false)
  })
})

describe('phoneInputValue', () => {
  it('keeps only the 11 national digits', () => {
    expect(phoneInputValue('0912 345 6789')).toBe('09123456789')
    expect(phoneInputValue('۰۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789')
    expect(phoneInputValue('09123456789999')).toBe('09123456789')
  })

  it('converts a pasted international number to the 09 form', () => {
    expect(phoneInputValue('+989123456789')).toBe('09123456789')
    expect(phoneInputValue('00989123456789')).toBe('09123456789')
  })
})
