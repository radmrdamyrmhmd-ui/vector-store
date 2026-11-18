import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiError } from '../lib/api.js'
import { ContactForm, VolunteerForm } from './forms.jsx'

const { apiMock } = vi.hoisted(() => ({ apiMock: vi.fn() }))

vi.mock('../lib/api.js', () => {
  class ApiError extends Error {
    constructor(message, status) {
      super(message)
      this.name = 'ApiError'
      this.status = status
    }
  }
  return { api: (...args) => apiMock(...args), ApiError }
})

const CONTACT_SUCCESS = 'پیام شما ثبت شد. در اولین فرصت پاسخ می‌دهیم.'
const VOLUNTEER_SUCCESS = 'درخواست همکاری شما ثبت شد. به‌زودی با شما تماس می‌گیریم.'

beforeEach(() => {
  apiMock.mockReset()
})

describe('ContactForm', () => {
  it('submits a valid phone number and shows the real success message', async () => {
    const user = userEvent.setup()
    apiMock.mockResolvedValueOnce({ message: CONTACT_SUCCESS })
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/نام و نام خانوادگی/), 'زهرا احمدی')
    await user.type(screen.getByLabelText(/شماره تماس/), '۰۹۱۲ ۳۴۵ ۶۷۸۹')
    await user.type(screen.getByLabelText(/متن پیام/), 'سلام، درباره کمک به کودکان سوال دارم.')
    await user.click(screen.getByRole('button', { name: 'ارسال پیام' }))

    await waitFor(() => expect(screen.getByText(CONTACT_SUCCESS)).toBeTruthy())

    expect(apiMock).toHaveBeenCalledTimes(1)
    const [path, options] = apiMock.mock.calls[0]
    expect(path).toBe('/contact')
    expect(options.method).toBe('POST')
    expect(options.body).toMatchObject({
      name: 'زهرا احمدی',
      phone: '09123456789',
      message: 'سلام، درباره کمک به کودکان سوال دارم.',
    })
    // The form is cleared only after a successful request.
    expect(screen.getByLabelText(/شماره تماس/).value).toBe('')
    expect(screen.getByLabelText(/متن پیام/).value).toBe('')
  })

  it('blocks an invalid phone number with a Persian message and sends nothing', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/نام و نام خانوادگی/), 'زهرا احمدی')
    await user.type(screen.getByLabelText(/شماره تماس/), '0912345')
    await user.type(screen.getByLabelText(/متن پیام/), 'سلام، درباره کمک به کودکان سوال دارم.')
    await user.click(screen.getByRole('button', { name: 'ارسال پیام' }))

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('شماره تماس معتبر نیست'))
    expect(apiMock).not.toHaveBeenCalled()
  })

  it('shows a network error, keeps the typed values and reports no success', async () => {
    const user = userEvent.setup()
    apiMock.mockRejectedValueOnce(
      new ApiError('ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.', 0)
    )
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/نام و نام خانوادگی/), 'زهرا احمدی')
    await user.type(screen.getByLabelText(/شماره تماس/), '09123456789')
    await user.type(screen.getByLabelText(/متن پیام/), 'سلام، درباره کمک به کودکان سوال دارم.')
    await user.click(screen.getByRole('button', { name: 'ارسال پیام' }))

    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('ارتباط با سرور برقرار نشد')
    )
    expect(screen.queryByText(CONTACT_SUCCESS)).toBeNull()
    expect(screen.getByLabelText(/نام و نام خانوادگی/).value).toBe('زهرا احمدی')
    expect(screen.getByLabelText(/شماره تماس/).value).toBe('09123456789')
    expect(screen.getByLabelText(/متن پیام/).value).toBe('سلام، درباره کمک به کودکان سوال دارم.')
  })

  it('disables the button while sending and never sends twice', async () => {
    const user = userEvent.setup()
    let resolveRequest
    apiMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve
        })
    )
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/نام و نام خانوادگی/), 'زهرا احمدی')
    await user.type(screen.getByLabelText(/شماره تماس/), '09123456789')
    await user.type(screen.getByLabelText(/متن پیام/), 'سلام، درباره کمک به کودکان سوال دارم.')
    const submit = screen.getByRole('button', { name: 'ارسال پیام' })
    await user.click(submit)

    await waitFor(() => expect(apiMock).toHaveBeenCalledTimes(1))
    expect(submit.disabled).toBe(true)

    await user.click(submit)
    expect(apiMock).toHaveBeenCalledTimes(1)

    resolveRequest({ message: CONTACT_SUCCESS })
    await waitFor(() => expect(screen.getByText(CONTACT_SUCCESS)).toBeTruthy())
  })
})

describe('VolunteerForm', () => {
  it('submits a valid phone number with the chosen interests', async () => {
    const user = userEvent.setup()
    apiMock.mockResolvedValueOnce({ message: VOLUNTEER_SUCCESS })
    render(<VolunteerForm />)

    await user.type(screen.getByLabelText(/نام و نام خانوادگی/), 'مریم رضایی')
    await user.type(screen.getByLabelText(/شماره تماس/), '+98 912 345 6789')
    await user.type(screen.getByLabelText(/شهر محل سکونت/), 'زاهدان')
    await user.click(screen.getByRole('button', { name: 'آموزش' }))
    await user.click(screen.getByRole('button', { name: 'ثبت درخواست همکاری' }))

    await waitFor(() => expect(screen.getByText(VOLUNTEER_SUCCESS)).toBeTruthy())

    expect(apiMock).toHaveBeenCalledTimes(1)
    const [path, options] = apiMock.mock.calls[0]
    expect(path).toBe('/volunteers')
    expect(options.method).toBe('POST')
    expect(options.body).toMatchObject({
      full_name: 'مریم رضایی',
      phone: '09123456789',
      city: 'زاهدان',
      interests: ['آموزش'],
    })
  })

  it('blocks an invalid phone number with a Persian message and sends nothing', async () => {
    const user = userEvent.setup()
    render(<VolunteerForm />)

    await user.type(screen.getByLabelText(/نام و نام خانوادگی/), 'مریم رضایی')
    await user.type(screen.getByLabelText(/شماره تماس/), '0812345678')
    await user.click(screen.getByRole('button', { name: 'آموزش' }))
    await user.click(screen.getByRole('button', { name: 'ثبت درخواست همکاری' }))

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('شماره تماس معتبر نیست'))
    expect(apiMock).not.toHaveBeenCalled()
  })

  it('shows the API error, keeps the typed values and reports no success', async () => {
    const user = userEvent.setup()
    apiMock.mockRejectedValueOnce(new ApiError('حداقل یک زمینه همکاری را انتخاب کنید.', 400))
    render(<VolunteerForm />)

    await user.type(screen.getByLabelText(/نام و نام خانوادگی/), 'مریم رضایی')
    await user.type(screen.getByLabelText(/شماره تماس/), '09123456789')
    await user.click(screen.getByRole('button', { name: 'آموزش' }))
    await user.click(screen.getByRole('button', { name: 'ثبت درخواست همکاری' }))

    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('حداقل یک زمینه همکاری را انتخاب کنید.')
    )
    expect(screen.queryByText(VOLUNTEER_SUCCESS)).toBeNull()
    expect(screen.getByLabelText(/نام و نام خانوادگی/).value).toBe('مریم رضایی')
    expect(screen.getByLabelText(/شماره تماس/).value).toBe('09123456789')
  })

  it('disables the button while sending and never sends twice', async () => {
    const user = userEvent.setup()
    let resolveRequest
    apiMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve
        })
    )
    render(<VolunteerForm />)

    await user.type(screen.getByLabelText(/نام و نام خانوادگی/), 'مریم رضایی')
    await user.type(screen.getByLabelText(/شماره تماس/), '09123456789')
    await user.click(screen.getByRole('button', { name: 'آموزش' }))
    const submit = screen.getByRole('button', { name: 'ثبت درخواست همکاری' })
    await user.click(submit)

    await waitFor(() => expect(apiMock).toHaveBeenCalledTimes(1))
    expect(submit.disabled).toBe(true)

    await user.click(submit)
    expect(apiMock).toHaveBeenCalledTimes(1)

    resolveRequest({ message: VOLUNTEER_SUCCESS })
    await waitFor(() => expect(screen.getByText(VOLUNTEER_SUCCESS)).toBeTruthy())
  })
})
