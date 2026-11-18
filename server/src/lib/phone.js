// Server-side phone validation. This is the authority: a value that fails here
// is rejected no matter what the browser accepted. It mirrors src/lib/phone.js
// on the client, and src/lib/phone.parity.test.js keeps the two in sync.

const TO_LATIN = {
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
}

export const toLatinDigits = (value) =>
  String(value ?? '').replace(/[۰-۹٠-٩]/g, (digit) => TO_LATIN[digit] || digit)

// Accepted forms: 09123456789 · 9123456789 · +989123456789 · 00989123456789,
// with spaces, dashes, dots or parentheses as separators.
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
