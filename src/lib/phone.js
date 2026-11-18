import { toLatinDigits } from './format.js'

// Single source of truth for Iranian mobile numbers on the client.
// Accepted forms (Persian/Arabic digits are converted first):
//   09123456789 · 9123456789 · +989123456789 · 00989123456789
// Separators (space, dash, dot, parentheses) are ignored: «۰۹۱۲ ۳۴۵ ۶۷۸۹».
export function normalizePhone(value) {
  const digits = toLatinDigits(value).replace(/[^\d]/g, '')
  if (!digits) return ''
  if (digits.startsWith('0098')) return `0${digits.slice(4)}`
  if (digits.startsWith('98') && digits.length === 12) return `0${digits.slice(2)}`
  if (digits.startsWith('9') && digits.length === 10) return `0${digits}`
  return digits
}

export function isValidPhone(value) {
  return /^09\d{9}$/.test(normalizePhone(value))
}

// Keeps the phone input limited to the 11 digits of a national mobile number.
// A +98/0098 prefix is folded into the 09… form as soon as it is typed, so an
// international number never gets truncated into an invalid national one.
export const phoneInputValue = (value) => {
  const digits = toLatinDigits(value).replace(/[^\d]/g, '')
  if (digits.startsWith('0098')) return `0${digits.slice(4)}`.slice(0, 11)
  if (digits.startsWith('98')) return `0${digits.slice(2)}`.slice(0, 11)
  return normalizePhone(digits).slice(0, 11)
}
