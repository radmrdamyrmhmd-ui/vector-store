import { useRef, useState } from 'react'
import clsx from 'clsx'
import { ImagePlus, Loader2, Paperclip, X } from 'lucide-react'
import { uploadFile } from '../../lib/api.js'
import { Notice } from '../../components/ui.jsx'

export function AdminHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[22px] leading-[1.5] text-ink">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[12.5px] leading-7 text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function Panel({ title, description, action, children, className }) {
  return (
    <section className={clsx('rounded-[22px] border border-line bg-white', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            {title && <h2 className="text-[14px] font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-1 text-[11.5px] leading-6 text-muted">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}

export function Table({ head, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-right">
        <thead>
          <tr className="border-b border-line text-[11.5px] text-muted">
            {head.map((cell) => (
              <th key={cell} className="whitespace-nowrap px-3 py-2.5 font-medium">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[12.5px] text-ink">{children}</tbody>
      </table>
    </div>
  )
}

export function EmptyRow({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-10 text-center text-[12.5px] text-muted">
        {children}
      </td>
    </tr>
  )
}

export function UploadField({ label, value, onChange, accept = 'image/*', preview = true, hint }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const url = await uploadFile(file)
      onChange(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <span className="mb-2 block text-[13px] font-medium text-ink">{label}</span>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {preview && value && (
          <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line bg-cream">
            {value.endsWith('.pdf') ? (
              <span className="grid h-full w-full place-items-center text-[10px] text-muted">PDF</span>
            ) : (
              <img src={value} alt="" className="h-full w-full object-cover" />
            )}
          </span>
        )}
        <div className="flex flex-1 items-center gap-2">
          <input
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
            placeholder="نشانی فایل یا بارگذاری فایل جدید"
            className="field text-[12px]"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand/25 px-3.5 py-2 text-[11.5px] text-brand transition hover:bg-brand-50 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : accept.includes('pdf') ? (
              <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            بارگذاری
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="حذف فایل"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-muted transition hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFile}
          className="hidden"
          aria-label={label}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-[11.5px] text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-[11px] text-muted">{hint}</p>
      )}
    </div>
  )
}

export function StatusPill({ status }) {
  const map = {
    paid: { label: 'تأییدشده', tone: 'bg-emerald-50 text-emerald-700' },
    pending: { label: 'در انتظار پرداخت', tone: 'bg-amber-50 text-amber-700' },
    failed: { label: 'ناموفق', tone: 'bg-red-50 text-red-700' },
    canceled: { label: 'لغوشده', tone: 'bg-cream text-muted' },
    new: { label: 'جدید', tone: 'bg-brand-50 text-brand' },
    contacted: { label: 'تماس گرفته شد', tone: 'bg-amber-50 text-amber-700' },
    accepted: { label: 'پذیرفته شد', tone: 'bg-emerald-50 text-emerald-700' },
    rejected: { label: 'رد شد', tone: 'bg-cream text-muted' },
  }
  const item = map[status] || { label: status, tone: 'bg-cream text-muted' }
  return (
    <span className={clsx('inline-flex rounded-full px-2.5 py-1 text-[10.5px]', item.tone)}>
      {item.label}
    </span>
  )
}

export function AdminNotice({ notice, onClose }) {
  if (!notice) return null
  return (
    <Notice tone={notice.tone} className="mb-5">
      <div className="flex items-start justify-between gap-4">
        <span>{notice.message}</span>
        <button type="button" onClick={onClose} aria-label="بستن پیام">
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </Notice>
  )
}
