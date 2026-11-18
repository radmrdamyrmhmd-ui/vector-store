const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

// Persian and Arabic-Indic digits typed on a Persian keyboard are converted to
// Latin digits before any numeric parsing or validation.
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

export const digitsOnly = (value) => toLatinDigits(value).replace(/[^\d]/g, '')

export const toFa = (value) =>
  String(value ?? '').replace(/\d/g, (digit) => FA_DIGITS[Number(digit)])

export const num = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '۰'
  return new Intl.NumberFormat('fa-IR').format(amount)
}

export const money = (value) => `${num(value)} تومان`

export const compactMoney = (value) => {
  const amount = Number(value || 0)
  if (!amount) return '۰ تومان'
  if (amount >= 1_000_000_000) return `${toFa((amount / 1_000_000_000).toFixed(1).replace('.0', ''))} میلیارد تومان`
  if (amount >= 1_000_000) return `${toFa((amount / 1_000_000).toFixed(1).replace('.0', ''))} میلیون تومان`
  if (amount >= 1000) return `${toFa(Math.round(amount / 1000))} هزار تومان`
  return money(amount)
}

export const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  } catch {
    return toFa(date.toISOString().slice(0, 10))
  }
}

export const formatDateTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return toFa(date.toISOString().slice(0, 16).replace('T', ' '))
  }
}

export const progressPercent = (raised, target) => {
  if (!target || Number(target) <= 0) return null
  return Math.min(100, Math.round((Number(raised || 0) / Number(target)) * 100))
}

export const paragraphs = (text) => {
  return String(text || '')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
}
