import { useState } from 'react'
import { api } from '../lib/api.js'
import { digitsOnly } from '../lib/format.js'
import { Button, Field, Input, Notice, Textarea } from './ui.jsx'

const INTEREST_FALLBACK = [
  'آموزش',
  'فعالیت اجتماعی',
  'تولید محتوا',
  'طراحی و برنامه‌نویسی',
  'پشتیبانی اجرایی',
  'کمک‌های مردمی',
]

export function VolunteerForm({ interests = INTEREST_FALLBACK }) {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    city: '',
    skills: '',
    note: '',
  })
  const [selected, setSelected] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const toggleInterest = (item) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item]
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (form.full_name.trim().length < 3) return setError('نام و نام خانوادگی را کامل وارد کنید.')
    if (!isValidPhone(form.phone)) return setError('شماره تماس معتبر نیست. نمونه: ۰۹۱۲۳۴۵۶۷۸۹')
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
      return setError('ایمیل وارد‌شده معتبر نیست.')
    }
    if (selected.length === 0) return setError('حداقل یک زمینه همکاری را انتخاب کنید.')

    setLoading(true)
    try {
      const data = await api('/volunteers', {
        method: 'POST',
        body: { ...form, interests: selected },
      })
      setSuccess(data.message)
      setForm({ full_name: '', phone: '', email: '', city: '', skills: '', note: '' })
      setSelected([])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface p-6 sm:p-8" noValidate>
      {success && (
        <Notice tone="success" className="mb-5">
          {success}
        </Notice>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="نام و نام خانوادگی" htmlFor="vol-name" required>
          <Input id="vol-name" value={form.full_name} onChange={update('full_name')} autoComplete="name" />
        </Field>
        <Field label="شماره تماس" htmlFor="vol-phone" required>
          <Input
            id="vol-phone"
            value={form.phone}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, phone: digitsOnly(event.target.value).slice(0, 11) }))
            }
            inputMode="tel"
            autoComplete="tel"
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
          />
        </Field>
        <Field label="ایمیل" htmlFor="vol-email">
          <Input id="vol-email" type="email" value={form.email} onChange={update('email')} autoComplete="email" />
        </Field>
        <Field label="شهر محل سکونت" htmlFor="vol-city">
          <Input id="vol-city" value={form.city} onChange={update('city')} />
        </Field>
        <Field label="مهارت‌ها و تخصص‌ها" htmlFor="vol-skills" className="sm:col-span-2">
          <Input id="vol-skills" value={form.skills} onChange={update('skills')} placeholder="مثلاً تدریس، طراحی گرافیک، حسابداری" />
        </Field>
      </div>

      <fieldset className="mt-5">
        <legend className="mb-3 text-[13px] font-medium text-ink">
          زمینه علاقه‌مندی به همکاری <span className="text-accent">*</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {interests.map((item) => {
            const active = selected.includes(item)
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleInterest(item)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 text-[12.5px] transition ${
                  active
                    ? 'border-brand bg-brand text-cream'
                    : 'border-line bg-white text-ink hover:border-brand/40'
                }`}
              >
                {item}
              </button>
            )
          })}
        </div>
      </fieldset>

      <Field label="توضیحات تکمیلی" htmlFor="vol-note" className="mt-5">
        <Textarea id="vol-note" rows={4} value={form.note} onChange={update('note')} placeholder="درباره زمان و نحوه همکاری خود بنویسید." />
      </Field>

      {error && (
        <Notice tone="error" className="mt-4">
          {error}
        </Notice>
      )}

      <Button type="submit" size="lg" className="mt-5 w-full sm:w-auto" loading={loading}>
        ثبت درخواست همکاری
      </Button>
      <p className="mt-3 text-[11px] leading-6 text-muted">
        اطلاعات شما فقط برای بررسی درخواست همکاری استفاده می‌شود و در اختیار شخص ثالث قرار نمی‌گیرد.
      </p>
    </form>
  )
}

export function NewsletterForm({ tone = 'dark' }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState({ tone: '', message: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setState({ tone: 'error', message: 'یک ایمیل معتبر وارد کنید.' })
      return
    }
    setLoading(true)
    try {
      const data = await api('/newsletter', { method: 'POST', body: { email } })
      setState({ tone: 'success', message: data.message })
      setEmail('')
    } catch (err) {
      setState({ tone: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          ایمیل
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="نشانی ایمیل شما"
          className={
            tone === 'light'
              ? 'w-full rounded-full border border-cream/25 bg-white/10 px-5 py-3 text-[14px] text-cream placeholder:text-cream/50 focus:border-accent focus:outline-none'
              : 'field rounded-full'
          }
          aria-invalid={state.tone === 'error'}
        />
        <Button type="submit" size="md" className="shrink-0" loading={loading}>
          عضویت
        </Button>
      </div>
      {state.message && (
        <p
          className={`mt-2.5 text-[11.5px] ${
            state.tone === 'success'
              ? tone === 'light'
                ? 'text-emerald-200'
                : 'text-emerald-700'
              : tone === 'light'
                ? 'text-amber-200'
                : 'text-red-600'
          }`}
          role="status"
        >
          {state.message}
        </p>
      )}
    </form>
  )
}

export function ContactForm() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (form.name.trim().length < 3) return setError('نام خود را کامل وارد کنید.')
    if (!form.phone && !form.email) return setError('شماره تماس یا ایمیل را برای پاسخ‌گویی وارد کنید.')
    if (form.phone && !isValidPhone(form.phone)) return setError('شماره تماس معتبر نیست.')
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
      return setError('ایمیل وارد‌شده معتبر نیست.')
    }
    if (form.message.trim().length < 10) return setError('متن پیام باید حداقل ۱۰ کاراکتر باشد.')

    setLoading(true)
    try {
      const data = await api('/contact', { method: 'POST', body: form })
      setSuccess(data.message)
      setForm({ name: '', phone: '', email: '', subject: '', message: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface p-6 sm:p-8" noValidate id="form">
      {success && (
        <Notice tone="success" className="mb-5">
          {success}
        </Notice>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="نام و نام خانوادگی" htmlFor="contact-name" required>
          <Input id="contact-name" value={form.name} onChange={update('name')} autoComplete="name" />
        </Field>
        <Field label="شماره تماس" htmlFor="contact-phone">
          <Input
            id="contact-phone"
            value={form.phone}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, phone: digitsOnly(event.target.value).slice(0, 11) }))
            }
            inputMode="tel"
            autoComplete="tel"
          />
        </Field>
        <Field label="ایمیل" htmlFor="contact-email">
          <Input id="contact-email" type="email" value={form.email} onChange={update('email')} autoComplete="email" />
        </Field>
        <Field label="موضوع" htmlFor="contact-subject">
          <Input id="contact-subject" value={form.subject} onChange={update('subject')} />
        </Field>
      </div>
      <Field label="متن پیام" htmlFor="contact-message" className="mt-4" required>
        <Textarea id="contact-message" rows={5} value={form.message} onChange={update('message')} />
      </Field>
      {error && (
        <Notice tone="error" className="mt-4">
          {error}
        </Notice>
      )}
      <Button type="submit" size="lg" className="mt-5 w-full sm:w-auto" loading={loading}>
        ارسال پیام
      </Button>
      <p className="mt-3 text-[11px] text-muted">
        میانگین زمان پاسخ‌گویی: دو روز کاری. برای موارد فوری از شماره تماس مجموعه استفاده کنید.
      </p>
    </form>
  )
}
