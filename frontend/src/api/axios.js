import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// 요청 인터셉터: localStorage → sessionStorage 순으로 토큰 확인
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 응답 인터셉터: 401 처리 — localStorage + sessionStorage 둘 다 삭제
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      ;['accessToken', 'refreshToken', 'authUser'].forEach((key) => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
