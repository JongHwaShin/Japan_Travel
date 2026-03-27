import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,       // { id, email, nickname }
      isLoggedIn: false,

      /**
       * 로그인 성공 시 호출
       * @param {{ id: number, email: string, nickname: string }} user
       * @param {string} accessToken
       * @param {string} refreshToken
       */
      login(user, accessToken, refreshToken) {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        set({ user, isLoggedIn: true })
      },

      /**
       * 로그아웃: 토큰 삭제 + 상태 초기화 + /login 이동
       */
      logout() {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ user: null, isLoggedIn: false })
        window.location.href = '/login'
      },
    }),
    {
      name: 'auth-storage',       // localStorage key
      partialize: (state) => ({   // 토큰은 별도 관리, user/isLoggedIn만 persist
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
)

export default useAuthStore
