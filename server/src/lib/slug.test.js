import { describe, expect, it } from 'vitest'
import { toSlug } from './slug.js'

describe('toSlug', () => {
  it('transliterates a Persian title into a stable ASCII slug', () => {
    expect(toSlug('حمایت تحصیلی از کودکان بلوچ')).toBe('hmait-thsili-az-kodkan-bloch')
    expect(toSlug('توانمندسازی زنان')).toBe('toanmndsazi-znan')
  })

  it('produces the same slug for the same title every time', () => {
    const title = 'گزارش نمونه فعالیت — دوره اول'
    expect(toSlug(title)).toBe(toSlug(title))
  })

  it('keeps latin titles usable', () => {
    expect(toSlug('School Support 2026')).toBe('school-support-2026')
  })

  it('drops punctuation, ZWNJ and repeated separators', () => {
    expect(toSlug('آموزش‌ها، سلامت و رفاه!')).toBe('amozsh-ha-slamt-o-rfah')
  })

  it('converts Persian digits', () => {
    expect(toSlug('گزارش ۱۴۰۴')).toBe('gzarsh-1404')
  })

  it('caps the length without ending on a dash', () => {
    const slug = toSlug('آموزش توانمندسازی زنان و کودکان بلوچ در مناطق محروم سیستان و بلوچستان')
    expect(slug.length).toBeLessThanOrEqual(60)
    expect(slug.endsWith('-')).toBe(false)
  })
})
