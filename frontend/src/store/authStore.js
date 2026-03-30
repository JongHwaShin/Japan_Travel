import { create } from 'zustand'

// 앱 시작 시 저장소에서 토큰/유저 복원 (localStorage 우선, 없으면 sessionStorage)
const getStoredToken = () =>
  localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')

const getStoredUser = () => {
  const raw = localStorage.getItem('authUser') || sessionStorage.getItem('authUser')
  try { return raw ? JSON.parse(raw) : null } catch { return null }
}

const useAuthStore = create((set) => ({
  user: getStoredUser(),
  isLoggedIn: !!getStoredToken(),

  /**
   * 로그인 성공 시 호출
   * @param {{ id: number, email: string, nickname: string }} user
   * @param {string} accessToken
   * @param {string} refreshToken
   * @param {boolean} autoLogin - true: localStorage(30일), false: sessionStorage(탭 닫으면 삭제)
   */
  login(user, accessToken, refreshToken, autoLogin = false) {
    const storage = autoLogin ? localStorage : sessionStorage
    storage.setItem('accessToken', accessToken)
    storage.setItem('refreshToken', refreshToken)
    storage.setItem('authUser', JSON.stringify(user))
    set({ user, isLoggedIn: true })
  },

  /**
   * 로그아웃: localStorage + sessionStorage 둘 다 삭제 후 /login 이동
   */
  logout() {
    ;['accessToken', 'refreshToken', 'authUser'].forEach((key) => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    })
    // 이전 버전 zustand persist 잔여 데이터 정리
    localStorage.removeItem('auth-storage')
    set({ user: null, isLoggedIn: false })
    window.location.href = '/login'
  },
}))

export default useAuthStore
