/**
 * FFZone – Axios API client
 * Attaches JWT Bearer token to every request; handles 401 auto-logout.
 */

import axios from 'axios'

export const getSafeApiUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'https://ffzone-1.onrender.com/api';
  // Force override if Vercel still injects the old suspended URL
  if (url.includes('ffzone-backend.onrender.com')) {
    url = 'https://ffzone-1.onrender.com/api';
  }
  // Ensure it starts with http/https if it's an external domain
  if (url.includes('onrender.com') && !url.startsWith('http')) {
    url = `https://${url}`;
  }
  return url;
};

const getBaseURL = () => {
  return getSafeApiUrl();
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
          const baseUrl = getSafeApiUrl().replace(/\/api\/?$/, '');
          const { data } = await axios.post(`${baseUrl}/api/token/refresh/`, { refresh })
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
  // For media files, use the backend base URL (not /api prefix)
  let apiUrl = getSafeApiUrl();
  // Strip /api suffix to get the backend root URL
  let baseUrl = apiUrl.replace(/\/api\/?$/, '')
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
