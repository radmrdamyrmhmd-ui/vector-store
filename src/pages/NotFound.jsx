import { Button } from '../components/ui.jsx'

export default function NotFound() {
  return (
    <section className="py-24">
      <div className="container-x max-w-xl text-center">
        <p className="text-[64px] font-semibold leading-none text-brand/20">۴۰۴</p>
        <h1 className="mt-4 text-[26px] text-ink">این صفحه پیدا نشد</h1>
        <p className="mt-3 text-[13.5px] leading-8 text-muted">
          ممکن است نشانی تغییر کرده باشد یا صفحه حذف شده باشد. از صفحه اصلی یا بخش پروژه‌ها ادامه
          دهید.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button to="/">بازگشت به صفحه اصلی</Button>
          <Button to="/projects" variant="outline">
            پروژه‌های حمایتی
          </Button>
        </div>
      </div>
    </section>
  )
}
