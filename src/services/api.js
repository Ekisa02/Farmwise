/**
 * api.js
 * All communication with the Express backend.
 * Base URL comes from .env → VITE_API_BASE_URL
 */

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

async function request(method, path, body, isFormData = false) {
  const headers = isFormData ? {} : { 'Content-Type': 'application/json' }
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

// ── Animals ──────────────────────────────────────────────────
export const animalsApi = {
  getAll:  ()           => request('GET',  '/api/animals'),
  create:  (data)       => request('POST', '/api/animals', data),
  update:  (id, data)   => request('PUT',  `/api/animals/${id}`, data),
  remove:  (id)         => request('DELETE',`/api/animals/${id}`),
}

// ── Milk Records ─────────────────────────────────────────────
export const milkApi = {
  getAll:  (animalId)   => request('GET',  `/api/milk/${animalId}`),
  save:    (data)       => request('POST', '/api/milk', data),           // { animalId, date, am, pm }
  getLast7:(animalId)   => request('GET',  `/api/milk/${animalId}/last7`),
}

// ── AI Health Scan ────────────────────────────────────────────
export const healthApi = {
  /**
   * Upload an image + metadata → returns AI vet report
   * @param {File}   file
   * @param {string} animalId
   * @param {string} scanType   e.g. "eye" | "udder" | ...
   * @param {string} location   e.g. "Westlands, Nairobi County, KE"
   */
  scan: (file, animalId, scanType, location) => {
    const fd = new FormData()
    fd.append('image',    file)
    fd.append('animalId', animalId)
    fd.append('scanType', scanType)
    fd.append('location', location)
    return request('POST', '/api/health/scan', fd, true)
  },

  /** Save a completed scan result */
  saveResult: (data) => request('POST', '/api/health/result', data),

  /** Get scan history for one animal */
  getHistory: (animalId) => request('GET', `/api/health/history/${animalId}`),

  /** Get all recent scans across herd */
  getRecent: () => request('GET', '/api/health/recent'),
}

// ── AI Feeding Advice ─────────────────────────────────────────
export const feedApi = {
  getAdvice: (concern, foods) =>
    request('POST', '/api/feed/advice', { concern, foods }),
}
