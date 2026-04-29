// ─── API BASE ─────────────────────────────────────────────────────────────────
// Set VITE_API_URL in Vercel → Settings → Environment Variables.
// Example value: https://your-backend.railway.app/api
// The build will succeed even if the var is missing; API calls will just fail at runtime.
const BASE = import.meta.env.VITE_API_URL || ''

function hdrs(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function req(method, path, token, body) {
  if (!BASE) throw new Error('VITE_API_URL is not set. Add it in Vercel → Environment Variables.')
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: hdrs(token),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  auth: {
    login:    (email, password)        => req('POST', '/auth/login',    null, { email, password }),
    register: (name, email, password)  => req('POST', '/auth/register', null, { name, email, password }),
  },
  income: {
    list:   (token, month) => req('GET',    `/income${month ? `?month=${month}` : ''}`, token),
    create: (token, data)  => req('POST',   '/income',       token, data),
    remove: (token, id)    => req('DELETE', `/income/${id}`,  token),
  },
  expenses: {
    list:   (token, month) => req('GET',    `/expenses${month ? `?month=${month}` : ''}`, token),
    create: (token, data)  => req('POST',   '/expenses',       token, data),
    remove: (token, id)    => req('DELETE', `/expenses/${id}`,  token),
  },
  summary: {
    get: (token, month) => req('GET', `/summary${month ? `?month=${month}` : ''}`, token),
  },
  assistant: {
    chat: (token, messages, month) => req('POST', '/assistant', token, { messages, month }),
  },
  export: {
    csvUrl: (month) => `${BASE}/export/csv?month=${month || new Date().toISOString().slice(0, 7)}`,
  },
}
