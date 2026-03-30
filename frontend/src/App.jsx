import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import PlacesPage from './pages/PlacesPage'
import PlaceDetailPage from './pages/PlaceDetailPage'
import LogsPage from './pages/LogsPage'
import LogDetailPage from './pages/LogDetailPage'
import LogWritePage from './pages/LogWritePage'
import TransportPage from './pages/TransportPage'
import ExchangePage from './pages/ExchangePage'
import CityPage from './pages/CityPage'
import useAuthStore from './store/authStore'

// 로그인/회원가입: 헤더·바텀탭 없이 단독 레이아웃
function AuthLayout() {
  return <Outlet />
}

// 메인 앱 레이아웃
function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="lg:max-w-desktop lg:mx-auto lg:px-6">
        <div className="lg:flex lg:gap-8">

          {/* PC 사이드바 */}
          <aside className="hidden lg:block lg:w-60 lg:flex-shrink-0 lg:pt-20">
            <div className="sticky top-20 space-y-1">
              {[
                { href: '/', label: '🏠 홈' },
                { href: '/places', label: '🍜 맛집/관광지' },
                { href: '/logs', label: '📝 여행일기' },
                { href: '/transport', label: '🚃 교통정보' },
                { href: '/exchange', label: '💴 환율' },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-text-sub hover:bg-orange-50 hover:text-primary transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

// 로그인 필요 라우트 보호
function PrivateRoute() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />
}

function App() {
  const logout = useAuthStore((s) => s.logout)

  // 앱 시작 시 토큰 유효성 확인 — 토큰 없으면 비로그인 상태로 정리
  useEffect(() => {
    const token =
      localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (!token) {
      // 토큰 없는데 잔여 데이터가 남아있을 경우 정리
      ;['accessToken', 'refreshToken', 'authUser', 'auth-storage'].forEach((key) => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })
    }
  }, [])

  return (
    <Routes>
      {/* 인증 페이지 (헤더/바텀탭 없음) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* 메인 앱 */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/places" element={<PlacesPage />} />
        <Route path="/places/:id" element={<PlaceDetailPage />} />
        <Route path="/city/:regionId" element={<CityPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/logs/:id" element={<LogDetailPage />} />

        <Route path="/transport" element={<TransportPage />} />
        <Route path="/exchange" element={<ExchangePage />} />

        {/* 로그인 필요 라우트 */}
        <Route element={<PrivateRoute />}>
          <Route path="/logs/write" element={<LogWritePage />} />
          <Route path="/profile" element={<div className="page-container"><p className="text-text-sub">프로필 페이지</p></div>} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
