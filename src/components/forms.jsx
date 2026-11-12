import { useMemo, useState } from 'react'
import { CheckCircle2, HeartHandshake, ShieldCheck } from 'lucide-react'
import { api } from '../lib/api.js'
import { money, num } from '../lib/format.js'
import { Button, Field, Input, Notice, Select, Textarea } from './ui.jsx'

const PRESETS = [100000, 200000, 500000, 1000000]

const digitsOnly = (value) => String(value || '').replace(/[^\d]/g, '')
const isValidPhone = (value) => /^0?9\d{9}$/.test(digitsOnly(value))

export function DonateForm({ projects = [], initialSlug = '' }) {
  const [preset, setPreset] = useState(PRESETS[2])
  const [custom, setCustom] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [projectSlug, setProjectSlug] = useState(initialSlug)
  const [anonymous, setAnonymous] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const amount = custom ? Number(digitsOnly(custom)) : preset
  const selectedProject = useMemo(
    () => projects.find((project) => project.slug === projectSlug),
    [projects, projectSlug]
  )

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!Number.isFinite(amount) || amount < 10000) {
      setError('حداقل مبلغ کمک ۱۰٬۰۰۰ تومان است.')
      return
    }
    if (!anonymous && name.trim().length < 3) {
      setError('نام و نام خانوادگی را کامل وارد کنید یا گزینه کمک ناشناس را انتخاب کنید.')
      return
    }
    if (!isValidPhone(phone)) {
      setError('شماره موبایل معتبر نیست. نمونه: ۰۹۱۲۳۴۵۶۷۸۹')
      return
    }

    setLoading(true)
    try {
      const project = projects.find((item) => item.slug === projectSlug)
      const data = await api('/donations', {
        method: 'POST',
        body: {
          amount,
          donor_name: anonymous ? '' : name,
          donor_phone: phone,
          project_id: project ? project.id : null,
          is_anonymous: anonymous,
          note,
        },
      })
      setResult(data)
      if (data.mode === 'gateway' && data.redirectUrl) {
        window.location.assign(data.redirectUrl)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (result && result.mode !== 'gateway') {
    return (
      <div className="card-surface p-7 sm:p-9">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-[20px] text-ink">درخواست کمک شما ثبت شد</h2>
        <p className="mt-3 text-[13.5px] leading-8 text-muted">{result.message}</p>
        <div className="mt-5 rounded-2xl border border-line bg-cream/60 px-5 py-4">
          <p className="text-[12px] text-muted">کد پیگیری</p>
          <p className="mt-1 font-mono text-[16px] tracking-widest text-ink">{result.tracking}</p>
        </div>
        <p className="mt-4 text-[11.5px] leading-6 text-muted">
          این درخواست تا زمان تأیید پرداخت، به‌عنوان کمک دریافت‌شده در گزارش‌های مالی ثبت نمی‌شود.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button to="/transparency" variant="outline" size="sm">
            گزارش شفافیت مالی
          </Button>
          <Button to="/" variant="ghost" size="sm">
            بازگشت به صفحه اصلی
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface p-6 sm:p-8" noValidate>
      <fieldset>
        <legend className="text-[14px] font-semibold text-ink">مبلغ کمک</legend>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {PRESETS.map((value) => {
            const active = !custom && preset === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setPreset(value)
                  setCustom('')
                }}
                aria-pressed={active}
                className={`rounded-2xl border px-3 py-3 text-[13px] transition ${
                  active
                    ? 'border-brand bg-brand text-cream'
                    : 'border-line bg-white text-ink hover:border-brand/40'
                }`}
              >
                {money(value)}
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => setCustom(custom || '150000')}
            aria-pressed={Boolean(custom)}
            className={`rounded-2xl border px-3 py-3 text-[13px] transition ${
              custom
                ? 'border-brand bg-brand text-cream'
                : 'border-line bg-white text-ink hover:border-brand/40'
            }`}
          >
            مبلغ دلخواه
          </button>
        </div>
        {custom !== '' && (
          <div className="mt-3">
            <Field label="مبلغ دلخواه (تومان)" htmlFor="custom-amount">
              <Input
                id="custom-amount"
                inputMode="numeric"
                value={custom}
                onChange={(event) => setCustom(digitsOnly(event.target.value))}
                placeholder="مثلاً ۳۰۰۰۰۰"
                aria-describedby="custom-amount-hint"
              />
            </Field>
            <p id="custom-amount-hint" className="mt-1.5 text-[11.5px] text-muted">
              مبلغ وارد‌شده: {amount ? money(amount) : '—'}
            </p>
          </div>
        )}
      </fieldset>

      <div className="my-6 hairline" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="نام و نام خانوادگی" htmlFor="donor-name" required={!anonymous}>
          <Input
            id="donor-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="نام کامل"
            autoComplete="name"
            disabled={anonymous}
          />
        </Field>
        <Field label="شماره موبایل" htmlFor="donor-phone" required hint="برای هماهنگی و ارسال رسید">
          <Input
            id="donor-phone"
            value={phone}
            onChange={(event) => setPhone(digitsOnly(event.target.value).slice(0, 11))}
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            inputMode="tel"
            autoComplete="tel"
          />
        </Field>
        <Field label="پروژه موردنظر" htmlFor="donor-project" className="sm:col-span-2">
          <Select
            id="donor-project"
            value={projects.some((project) => project.slug === projectSlug) ? projectSlug : ''}
            onChange={(event) => setProjectSlug(event.target.value)}
          >
            <option value="">کمک به کلیه فعالیت‌ها</option>
            {projects.map((project) => (
              <option key={project.slug} value={project.slug}>
                {project.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="توضیحات (اختیاری)" htmlFor="donor-note" className="sm:col-span-2">
          <Textarea
            id="donor-note"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="اگر توضیحی برای همکاران ما دارید بنویسید."
          />
        </Field>
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl bg-cream/60 px-4 py-3">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(event) => setAnonymous(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-line accent-brand"
        />
        <span className="text-[12.5px] leading-6 text-muted">
          تمایل دارم کمک من به‌صورت ناشناس ثبت شود. مشخصات من فقط برای هماهنگی در اختیار مجموعه
          قرار می‌گیرد.
        </span>
      </label>

      {error && (
        <Notice tone="error" className="mt-4">
          {error}
        </Notice>
      )}

      <div className="mt-6 rounded-2xl border border-line bg-cream/50 px-5 py-4">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-muted">مبلغ نهایی کمک</span>
          <span className="font-semibold text-ink">{amount ? money(amount) : '—'}</span>
        </div>
        {selectedProject && (
          <p className="mt-1.5 text-[11.5px] text-muted">اختصاص به: {selectedProject.title}</p>
        )}
      </div>

      <Button type="submit" size="lg" className="mt-5 w-full" loading={loading}>
        <HeartHandshake className="h-4 w-4" aria-hidden="true" />
        ادامه و پرداخت کمک مالی
      </Button>

      <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-[11px] leading-6 text-muted">
        <ShieldCheck className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        اطلاعات شما محرمانه نگهداری می‌شود. وضعیت پرداخت فقط پس از تأیید درگاه ثبت می‌گردد.
      </p>
    </form>
  )
}

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

export function AmountSummary({ amount }) {
  return <span>{amount ? `${num(amount)} تومان` : '—'}</span>
}
