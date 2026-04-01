import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const NAV_ITEMS = [
  { to: '/', label: '홈', icon: '🏠', end: true },
  { to: '/places', label: '맛집/관광지', icon: '🍜' },
  { to: '/logs', label: '여행일기', icon: '📝' },
  { to: '/transport', label: '교통정보', icon: '🚃' },
  { to: '/exchange', label: '환율계산기', icon: '💴' },
]

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const location = useLocation()

  // 페이지 이동 시 사이드바 닫기
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // 사이드바 열릴 때 body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  return (
    <>
      <header className="
        fixed top-0 left-0 right-0 z-50
        bg-card border-b border-gray-100 shadow-sm
        pt-safe
      ">
        <div className="lg:max-w-desktop lg:mx-auto lg:px-6">
          <div className="flex items-center justify-between px-4 h-14 lg:px-0">

            {/* 햄버거 */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col justify-center gap-1.5 w-7 h-7 touch-target"
              aria-label="메뉴 열기"
            >
              <span className="block w-5 h-0.5 bg-text-main rounded-full" />
              <span className="block w-5 h-0.5 bg-text-main rounded-full" />
              <span className="block w-5 h-0.5 bg-text-main rounded-full" />
            </button>

            {/* PC 전용 상단 네비게이션 */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary bg-orange-50'
                        : 'text-text-sub hover:text-text-main hover:bg-gray-50'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* 프로필/로그인 */}
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="touch-target">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                    {user?.nickname?.[0] ?? '나'}
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-text-sub hover:text-text-main transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link to="/login" className="touch-target">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7 text-text-sub"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              </Link>
            )}

          </div>
        </div>
      </header>

      {/* 오버레이 */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 사이드바 */}
      <aside
        className={`fixed top-0 left-0 z-[70] h-full w-[280px] bg-white shadow-2xl
          flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* 상단: 로고 + 닫기 */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗾</span>
            <span className="text-base font-bold text-text-main">일본여행</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-text-sub hover:text-text-main transition-colors"
            aria-label="메뉴 닫기"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 프로필 영역 */}
        <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                {user?.nickname?.[0] ?? '나'}
              </Link>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-main truncate">{user?.nickname}</p>
                <p className="text-xs text-text-sub truncate">{user?.email}</p>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center w-full h-10 rounded-xl bg-primary text-white text-sm font-semibold"
            >
              로그인
            </Link>
          )}
        </div>

        {/* 메뉴 목록 */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ to, label, icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-orange-50 text-primary'
                        : 'text-text-sub hover:bg-gray-50 hover:text-text-main'
                    }`
                  }
                >
                  <span className="text-lg leading-none">{icon}</span>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* 하단: 로그아웃 */}
        {isLoggedIn && (
          <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-text-sub hover:bg-gray-50 hover:text-text-main transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              로그아웃
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
