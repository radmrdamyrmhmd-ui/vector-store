import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CircleCheck, FlaskConical, HandCoins, Lock } from 'lucide-react'
import { api } from '../lib/api.js'
import { digitsOnly, money } from '../lib/format.js'
import { Button, Field, Input, Notice, Select, Textarea } from './ui.jsx'

const PRESETS = [100000, 250000, 500000, 1000000, 2000000]
const MIN_AMOUNT = 10000
const MAX_AMOUNT = 500000000

const isValidPhone = (value) => /^0?9\d{9}$/.test(digitsOnly(value))

export default function DonateWizard({ projects = [], initialSlug = '' }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [preset, setPreset] = useState(PRESETS[1])
  const [custom, setCustom] = useState('')
  const [projectSlug, setProjectSlug] = useState(initialSlug)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const amount = custom ? Number(digitsOnly(custom)) : preset
  const selectedProject = useMemo(
    () => projects.find((project) => project.slug === projectSlug) || null,
    [projects, projectSlug]
  )

  function validateStepOne() {
    if (!Number.isFinite(amount) || amount < MIN_AMOUNT) {
      return 'حداقل مبلغ کمک ۱۰٬۰۰۰ تومان است.'
    }
    if (amount > MAX_AMOUNT) {
      return 'برای مبالغ بالاتر از ۵۰۰ میلیون تومان با ما تماس بگیرید.'
    }
    return ''
  }

  function goToDonor(event) {
    event.preventDefault()
    const problem = validateStepOne()
    if (problem) {
      setError(problem)
      return
    }
    setError('')
    setStep(2)
  }

  async function submit(event) {
    event.preventDefault()
    const problem = validateStepOne()
    if (problem) {
      setError(problem)
      setStep(1)
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

    setError('')
    setLoading(true)
    try {
      const data = await api('/donations', {
        method: 'POST',
        body: {
          amount,
          donor_name: anonymous ? '' : name,
          donor_phone: phone,
          project_id: selectedProject ? selectedProject.id : null,
          is_anonymous: anonymous,
          note,
        },
      })
      if (data.mode === 'gateway' && data.redirectUrl) {
        window.location.assign(data.redirectUrl)
        return
      }
      navigate(`/donate/checkout/${data.tracking}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card-surface overflow-hidden">
      <div className="border-b border-line bg-cream/50 px-6 py-4 sm:px-8">
        <ol className="flex items-center gap-3 text-[12px]" aria-label="مراحل کمک">
          {[
            { id: 1, label: 'مبلغ و پروژه' },
            { id: 2, label: 'اطلاعات اهداکننده' },
            { id: 3, label: 'تأیید و پرداخت' },
          ].map((item, index) => {
            const state = step === item.id ? 'current' : step > item.id ? 'done' : 'upcoming'
            return (
              <li key={item.id} className="flex flex-1 items-center gap-2">
                <span
                  aria-current={state === 'current' ? 'step' : undefined}
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-medium ${
                    state === 'current'
                      ? 'bg-brand text-cream'
                      : state === 'done'
                        ? 'bg-brand-100 text-brand'
                        : 'bg-white text-muted'
                  }`}
                >
                  {state === 'done' ? <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" /> : item.id}
                </span>
                <span className={state === 'upcoming' ? 'text-muted' : 'text-ink'}>{item.label}</span>
                {index < 2 && <span className="hidden h-px flex-1 bg-line sm:block" aria-hidden="true" />}
              </li>
            )
          })}
        </ol>
      </div>

      {step === 1 ? (
        <form onSubmit={goToDonor} className="p-6 sm:p-8" noValidate>
          <fieldset>
            <legend className="text-[14px] font-semibold text-ink">مبلغ کمک</legend>
            <p className="mt-1 text-[12px] text-muted">
              مبلغ به تومان است. در این نسخه هیچ مبلغی از حساب شما کسر نمی‌شود.
            </p>
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
                      setError('')
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
                onClick={() => {
                  setCustom(custom || '150000')
                  setError('')
                }}
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
                    onChange={(event) => setCustom(digitsOnly(event.target.value).slice(0, 12))}
                    placeholder="مثلاً 300000"
                    dir="ltr"
                    aria-describedby="custom-amount-hint"
                  />
                </Field>
                <p id="custom-amount-hint" className="mt-1.5 text-[11.5px] text-muted">
                  مبلغ واردشده: {amount ? money(amount) : '—'}
                </p>
              </div>
            )}
          </fieldset>

          <div className="my-6 hairline" />

          <Field
            label="پروژه موردنظر"
            htmlFor="donor-project"
            hint="اگر پروژه‌ای انتخاب نکنید، کمک شما به کلیه فعالیت‌ها اختصاص می‌یابد."
          >
            <Select
              id="donor-project"
              value={selectedProject ? selectedProject.slug : ''}
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

          {error && (
            <Notice tone="error" className="mt-5">
              {error}
            </Notice>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream/60 px-5 py-4">
            <div>
              <p className="text-[11.5px] text-muted">مبلغ انتخاب‌شده</p>
              <p className="mt-0.5 text-[16px] font-semibold text-ink">{amount ? money(amount) : '—'}</p>
            </div>
            <Button type="submit" size="md">
              ادامه
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={submit} className="p-6 sm:p-8" noValidate>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-cream/50 px-4 py-3">
            <div className="flex items-center gap-2 text-[12.5px] text-ink">
              <HandCoins className="h-4 w-4 text-brand" aria-hidden="true" />
              <span className="font-semibold">{money(amount)}</span>
              <span className="text-muted">|</span>
              <span className="text-muted">
                {selectedProject ? selectedProject.title : 'کلیه فعالیت‌ها'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-[12px] text-brand underline underline-offset-4"
            >
              ویرایش
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
            <Field label="شماره موبایل" htmlFor="donor-phone" required hint="فقط برای پیگیری کمک شما">
              <Input
                id="donor-phone"
                value={phone}
                onChange={(event) => setPhone(digitsOnly(event.target.value).slice(0, 11))}
                placeholder="09123456789"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
              />
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
              تمایل دارم کمک من به‌صورت ناشناس ثبت شود. مشخصات من فقط برای پیگیری در اختیار مجموعه
              قرار می‌گیرد.
            </span>
          </label>

          <Notice tone="warning" className="mt-5">
            <p className="flex items-center gap-1.5 font-medium">
              <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
              پرداخت در این نسخه شبیه‌سازی می‌شود
            </p>
            <p>
              در مرحله بعد یک صفحه تأیید آزمایشی نمایش داده می‌شود. هیچ اطلاعات کارت بانکی خواسته
              نمی‌شود، هیچ مبلغی کسر نمی‌گردد و نتیجه با برچسب «پرداخت شبیه‌سازی‌شده» ثبت می‌شود.
            </p>
          </Notice>

          {error && (
            <Notice tone="error" className="mt-5">
              {error}
            </Notice>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button type="submit" loading={loading}>
              ثبت و ادامه به تأیید
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
              بازگشت
            </Button>
            <span className="flex items-center gap-1.5 text-[11px] text-muted">
              <Lock className="h-3 w-3" aria-hidden="true" />
              اطلاعات شما فقط در همین سایت ذخیره می‌شود.
            </span>
          </div>
        </form>
      )}
    </div>
  )
}
