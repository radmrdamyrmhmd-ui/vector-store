export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function api(path, options = {}) {
  const { method = 'GET', body, headers, ...rest } = options
  let response
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: 'include',
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    })
  } catch {
    throw new ApiError('ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.', 0)
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(data.error || 'خطایی رخ داد. لطفاً دوباره تلاش کنید.', response.status)
  }
  return data
}

export async function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch('/api/admin/upload', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(data.error || 'بارگذاری فایل ناموفق بود.', response.status)
  }
  return data.url
}
