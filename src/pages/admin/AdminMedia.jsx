import { useRef, useState } from 'react'
import { Check, Copy, FileText, ImageIcon, Trash2, Upload } from 'lucide-react'
import { api, uploadFile } from '../../lib/api.js'
import { useResource } from '../../lib/useResource.js'
import { Button, Empty, Spinner } from '../../components/ui.jsx'
import { AdminHeader, AdminNotice, Panel } from './parts.jsx'
import { formatDate, num, toFa } from '../../lib/format.js'

const FILTERS = [
  { key: '', label: 'همه' },
  { key: 'image', label: 'تصاویر' },
  { key: 'document', label: 'اسناد' },
]

const sizeLabel = (bytes) => {
  const value = Number(bytes || 0)
  if (!value) return '—'
  if (value >= 1024 * 1024) return `${toFa((value / (1024 * 1024)).toFixed(1))} مگابایت`
  return `${toFa(Math.max(1, Math.round(value / 1024)))} کیلوبایت`
}

export default function AdminMedia() {
  const [kind, setKind] = useState('')
  const { data, loading, error, reload } = useResource(() => api(`/admin/media?kind=${kind}`), [kind])
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState('')
  const inputRef = useRef(null)
  const items = data?.items || []
  const totals = data?.totals || { files: 0, bytes: 0 }

  async function handleFiles(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (files.length === 0) return
    setBusy(true)
    let uploaded = 0
    try {
      for (const file of files) {
        await uploadFile(file)
        uploaded += 1
      }
      setNotice({ tone: 'success', message: `${toFa(uploaded)} فایل بارگذاری شد.` })
      reload()
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
      if (uploaded > 0) reload()
    } finally {
      setBusy(false)
    }
  }

  async function copy(url) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(url)
      window.setTimeout(() => setCopied(''), 1600)
    } catch {
      setNotice({ tone: 'error', message: 'مرورگر اجازه کپی نداد. نشانی را دستی انتخاب کنید.' })
    }
  }

  async function remove(item) {
    if (!window.confirm('این فایل از کتابخانه و از روی سرور حذف شود؟ اگر در صفحه‌ای استفاده شده باشد، آنجا خالی خواهد شد.')) return
    try {
      await api(`/admin/media/${item.id}`, { method: 'DELETE' })
      setNotice({ tone: 'success', message: 'فایل حذف شد.' })
      reload()
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
    }
  }

  return (
    <>
      <AdminHeader
        title="رسانه و فایل‌ها"
        description="تصاویر و PDFهای بارگذاری‌شده در یک جا قابل مدیریت هستند. فایل‌ها روی سرور خودتان ذخیره می‌شوند، نه سرویس بیرونی."
        action={
          <Button size="sm" onClick={() => inputRef.current?.click()} loading={busy}>
            <Upload className="h-4 w-4" aria-hidden="true" />
            بارگذاری فایل
          </Button>
        }
      />

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,application/pdf"
        onChange={handleFiles}
        className="hidden"
        aria-label="انتخاب فایل برای بارگذاری"
      />

      <AdminNotice notice={notice} onClose={() => setNotice(null)} />
      {error && <AdminNotice notice={{ tone: 'error', message: error }} onClose={() => {}} />}

      <Panel
        title={`کتابخانه (${num(totals.files)} فایل — ${sizeLabel(totals.bytes)})`}
        action={
          <div className="flex gap-1">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setKind(filter.key)}
                className={`rounded-full px-3 py-1 text-[11px] transition ${
                  kind === filter.key ? 'bg-brand text-cream' : 'bg-cream text-muted hover:text-brand'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        }
      >
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <Empty
            icon={ImageIcon}
            title="کتابخانه خالی است"
            text="تصویر یا PDF بارگذاری کنید تا نشانی آن برای استفاده در پروژه‌ها، مقالات و تنظیمات در دسترس باشد."
          />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => {
              const isImage = (item.mime || '').startsWith('image/')
              return (
                <li key={item.id} className="overflow-hidden rounded-2xl border border-line bg-white">
                  <div className="relative aspect-[4/3] bg-cream">
                    {isImage ? (
                      <img
                        src={item.url}
                        alt={item.original_name || 'فایل بارگذاری‌شده'}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-muted">
                        <FileText className="h-8 w-8" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-[11.5px] font-medium text-ink" title={item.original_name || item.filename}>
                      {item.original_name || item.filename}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted">
                      {sizeLabel(item.size_bytes)} · {formatDate(item.created_at)}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => copy(item.url)}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-line px-2 py-1.5 text-[10.5px] text-muted transition hover:text-brand"
                      >
                        {copied === item.url ? (
                          <>
                            <Check className="h-3 w-3" aria-hidden="true" /> کپی شد
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" aria-hidden="true" /> نشانی
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item)}
                        aria-label={`حذف ${item.original_name || item.filename}`}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-line text-muted transition hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>
    </>
  )
}
