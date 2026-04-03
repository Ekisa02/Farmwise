const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

function getToken() {
  return localStorage.getItem('fw_token')
}

async function request(method, path, body, isFormData = false) {
  const token = getToken()
  const headers = {}
  if (!isFormData) headers['Content-Type'] = 'application/json'
  if (token)       headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || 'Request failed')
  }
  return res.json()
}

// ── Auth ─────────────────────────────────────────────────────
export const authApi = {
  register: (data)  => request('POST', '/api/auth/register', data),
  login:    (data)  => request('POST', '/api/auth/login',    data),
  me:       ()      => request('GET',  '/api/auth/me'),
}

// ── Animals ──────────────────────────────────────────────────
export const animalsApi = {
  getAll:  ()           => request('GET',    '/api/animals'),
  create:  (data)       => request('POST',   '/api/animals',      data),
  update:  (id, data)   => request('PUT',    `/api/animals/${id}`, data),
  remove:  (id)         => request('DELETE', `/api/animals/${id}`),
}

// ── Milk Records ─────────────────────────────────────────────
export const milkApi = {
  getAll:   (animalId) => request('GET',  `/api/milk/${animalId}`),
  getLast7: (animalId) => request('GET',  `/api/milk/${animalId}/last7`),
  save:     (data)     => request('POST', '/api/milk', data),
}

// ── Health Scan ───────────────────────────────────────────────
export const healthApi = {
  scan: (file, animalId, scanType, location) => {
    const fd = new FormData()
    fd.append('image',    file)
    fd.append('animalId', animalId)
    fd.append('scanType', scanType)
    fd.append('location', location)
    return request('POST', '/api/health/scan', fd, true)
  },
  getHistory: (animalId) => request('GET', `/api/health/history/${animalId}`),
  getRecent:  ()         => request('GET', '/api/health/recent'),
}

// ── Feed Advice ───────────────────────────────────────────────
export const feedApi = {
  getAdvice: (concern, foods) => request('POST', '/api/feed/advice', { concern, foods }),
}
