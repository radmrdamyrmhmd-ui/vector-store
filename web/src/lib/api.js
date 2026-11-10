const BASE = '/api';

async function request(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json', ...headers } : headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const error = new Error(data?.error || 'ارتباط با سرور برقرار نشد.');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  upload: async (file) => {
    const form = new FormData();
    form.append('image', file);
    const res = await fetch(`${BASE}/admin/upload`, {
      method: 'POST',
      body: form,
      credentials: 'same-origin',
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || 'بارگذاری تصویر ناموفق بود.');
    return data;
  },
};
