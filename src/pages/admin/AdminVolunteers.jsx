import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useResource } from '../../lib/useResource.js'
import { Notice, Select, Spinner } from '../../components/ui.jsx'
import { AdminHeader, Panel, StatusPill } from './parts.jsx'
import { formatDateTime, num } from '../../lib/format.js'

const STATUSES = [
  { value: 'new', label: 'جدید' },
  { value: 'contacted', label: 'تماس گرفته شد' },
  { value: 'accepted', label: 'پذیرفته شد' },
  { value: 'rejected', label: 'رد شد' },
]

export default function AdminVolunteers() {
  const { data, loading, error, reload } = useResource(() => api('/admin/volunteers'), [])
  const [notice, setNotice] = useState(null)
  const [openId, setOpenId] = useState(null)
  const volunteers = data || []

  async function changeStatus(volunteer, status) {
    try {
      await api(`/admin/volunteers/${volunteer.id}`, { method: 'PATCH', body: { status } })
      setNotice({ tone: 'success', message: 'وضعیت درخواست به‌روزرسانی شد.' })
      reload()
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
    }
  }

  async function remove(volunteer) {
    if (!window.confirm(`درخواست «${volunteer.full_name}» حذف شود؟`)) return
    try {
      await api(`/admin/volunteers/${volunteer.id}`, { method: 'DELETE' })
      setNotice({ tone: 'success', message: 'درخواست حذف شد.' })
      reload()
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
    }
  }

  return (
    <>
      <AdminHeader
        title="درخواست‌های داوطلبی"
        description="درخواست‌های ثبت‌شده از فرم همکاری. اطلاعات تماس داوطلبان محرمانه است."
      />

      {error && <Notice tone="error" className="mb-5">{error}</Notice>}
      {notice && <Notice tone={notice.tone} className="mb-5">{notice.message}</Notice>}

      {loading ? (
        <Spinner />
      ) : volunteers.length === 0 ? (
        <Panel title="درخواست‌ها">
          <p className="py-8 text-center text-[12.5px] text-muted">هنوز درخواستی ثبت نشده است.</p>
        </Panel>
      ) : (
        <div className="space-y-3">
          <p className="text-[11.5px] text-muted">{num(volunteers.length)} درخواست ثبت‌شده</p>
          {volunteers.map((volunteer) => (
            <div key={volunteer.id} className="rounded-[20px] border border-line bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14px] font-medium text-ink">{volunteer.full_name}</p>
                    <StatusPill status={volunteer.status} />
                    <span className="text-[10.5px] text-muted">{formatDateTime(volunteer.created_at)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-[11.5px] text-muted">
                    <span dir="ltr">{volunteer.phone}</span>
                    {volunteer.email && <span dir="ltr">{volunteer.email}</span>}
                    {volunteer.city && <span>{volunteer.city}</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(volunteer.interests || []).map((interest) => (
                      <span key={interest} className="rounded-full bg-brand-50 px-2.5 py-1 text-[10.5px] text-brand">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={volunteer.status}
                    onChange={(event) => changeStatus(volunteer, event.target.value)}
                    className="w-40 py-2 text-[11.5px]"
                    aria-label={`وضعیت ${volunteer.full_name}`}
                  >
                    {STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </Select>
                  <button
                    type="button"
                    onClick={() => remove(volunteer)}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition hover:text-red-600"
                    aria-label={`حذف درخواست ${volunteer.full_name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {(volunteer.skills || volunteer.note) && (
                <div className="mt-3 border-t border-line pt-3">
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === volunteer.id ? null : volunteer.id)}
                    className="text-[11.5px] text-brand"
                  >
                    {openId === volunteer.id ? 'بستن جزئیات' : 'مشاهده جزئیات'}
                  </button>
                  {openId === volunteer.id && (
                    <div className="mt-2 space-y-1.5 text-[11.5px] leading-6 text-muted">
                      {volunteer.skills && <p>مهارت‌ها: {volunteer.skills}</p>}
                      {volunteer.note && <p>توضیحات: {volunteer.note}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
