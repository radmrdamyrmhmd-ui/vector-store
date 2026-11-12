const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

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
