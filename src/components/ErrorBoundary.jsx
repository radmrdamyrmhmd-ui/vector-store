import { Component } from 'react'
import { reportClientError } from '../lib/errors.js'

// Catches render-time crashes so a broken component cannot leave the visitor
// with a blank page. The fallback reuses the site's existing visual language.
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error, info) {
    reportClientError('ui-render', error)
    if (import.meta.env.DEV && info?.componentStack) {
      console.error(info.componentStack)
    }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
        <div className="card-surface max-w-md p-8 text-center">
          <h1 className="text-lg font-semibold text-ink">خطایی در نمایش این صفحه رخ داد</h1>
          <p className="mt-3 text-[13px] leading-7 text-muted">
            مشکل موقتی است. صفحه را دوباره بارگذاری کنید؛ اگر تکرار شد با ما تماس بگیرید.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-[14px] font-medium text-cream transition hover:bg-brand-dark"
          >
            بارگذاری مجدد صفحه
          </button>
        </div>
      </div>
    )
  }
}
