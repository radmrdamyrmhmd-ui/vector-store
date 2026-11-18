// URL slugs for Persian titles.
//
// Persian letters are transliterated to ASCII so a slug is stable, readable in
// any browser and safe for crawlers and social previews. The same title always
// produces the same slug (no random suffix), which keeps published URLs from
// changing between edits.

const MAP = {
  آ: 'a',
  ا: 'a',
  أ: 'a',
  إ: 'e',
  ب: 'b',
  پ: 'p',
  ت: 't',
  ث: 's',
  ج: 'j',
  چ: 'ch',
  ح: 'h',
  خ: 'kh',
  د: 'd',
  ذ: 'z',
  ر: 'r',
  ز: 'z',
  ژ: 'zh',
  س: 's',
  ش: 'sh',
  ص: 's',
  ض: 'z',
  ط: 't',
  ظ: 'z',
  ع: 'a',
  غ: 'gh',
  ف: 'f',
  ق: 'gh',
  ک: 'k',
  ك: 'k',
  گ: 'g',
  ل: 'l',
  م: 'm',
  ن: 'n',
  و: 'o',
  ه: 'h',
  ی: 'i',
  ي: 'i',
  ئ: 'i',
  ء: '',
  ؤ: 'o',
  ة: 'h',
  ى: 'a',
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
}

const MAX_LENGTH = 60

export function toSlug(value) {
  const ascii = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\u200c\u200f\u200e]/g, ' ')
    .split('')
    .map((char) => (char in MAP ? MAP[char] : char))
    .join('')
    .replace(/['"’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  if (ascii.length <= MAX_LENGTH) return ascii
  return ascii.slice(0, MAX_LENGTH).replace(/-[^-]*$/, '')
}
