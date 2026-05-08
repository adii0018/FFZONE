/**
 * FFZone – Axios API client
 * Attaches JWT Bearer token to every request; handles 401 auto-logout.
 */

import axios from 'axios'

const getBaseURL = () => {
  let url = import.meta.env.VITE_API_URL || '/api';
  // Ensure it starts with http/https if it's an external domain
  if (url.includes('onrender.com') && !url.startsWith('http')) {
    url = `https://${url}`;
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
})

// ── Request Interceptor ────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response Interceptor – auto refresh on 401 ────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/token/refresh/`, { refresh })
          localStorage.setItem('access_token', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path
  }
  let baseUrl = import.meta.env.VITE_API_URL || ''
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1)
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

export const getAvatarUrl = (seed) => {
  return `https://api.dicebear.com/9.x/toon-head/svg?seed=${encodeURIComponent(seed || 'FFZone')}`
}

export default api
