import { Link, NavLink } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const PC_NAV_ITEMS = [
  { to: '/', label: '홈', end: true },
  { to: '/places', label: '맛집/관광지' },
  { to: '/logs', label: '여행일기' },
  { to: '/transport', label: '교통정보' },
  { to: '/exchange', label: '환율' },
]

export default function Header() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <header className="
      fixed top-0 left-0 right-0 z-50
      bg-card border-b border-gray-100 shadow-sm
      pt-safe
    ">
      <div className="lg:max-w-desktop lg:mx-auto lg:px-6">
        <div className="flex items-center justify-between px-4 h-14 lg:px-0">

          {/* 로고 */}
          <Link to="/" className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xl">🗾</span>
            <span className="text-base font-bold text-text-main">일본여행</span>
          </Link>

          {/* PC 전용 상단 네비게이션 */}
          <nav className="hidden lg:flex items-center gap-1">
            {PC_NAV_ITEMS.map(({ to, label, end }) => (
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

          {/* 프로필/로그인 아이콘 */}
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="touch-target">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                  {user?.nickname?.[0] ?? '나'}
                </div>
              </Link>
              <button
                onClick={logout}
                className="hidden lg:block text-xs text-text-sub hover:text-text-main transition-colors"
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
  )
}
