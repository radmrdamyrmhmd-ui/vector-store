const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function faNum(value) {
  return String(value ?? '').replace(/\d/g, (digit) => FA_DIGITS[Number(digit)]);
}

export function formatPrice(value) {
  const amount = Number(value) || 0;
  return `${faNum(amount.toLocaleString('en-US'))} تومان`;
}

export function formatNumber(value) {
  return faNum((Number(value) || 0).toLocaleString('en-US'));
}

export function formatDate(value) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(value));
  } catch {
    return '';
  }
}

export const STATUS_LABELS = {
  pending: 'در انتظار بررسی',
  paid: 'پرداخت‌شده',
  shipped: 'ارسال‌شده',
  delivered: 'تحویل‌شده',
  cancelled: 'لغوشده',
};

export const CATEGORY_LABELS = {
  running: 'کفش دویدن',
  training: 'کفش تمرینی',
  lifestyle: 'کفش روزمره',
  walking: 'کفش پیاده‌روی',
  apparel: 'پوشاک ورزشی',
};

export const GENDER_LABELS = {
  male: 'مردانه',
  female: 'زنانه',
  unisex: 'یونیسکس',
};

export function toEnglishDigits(value) {
  return String(value ?? '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}
