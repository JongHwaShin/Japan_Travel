import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: '홈', icon: '🏠' },
  { to: '/places', label: '맛집/관광지', icon: '🍜' },
  { to: '/logs', label: '여행일기', icon: '📝' },
  { to: '/transport', label: '교통정보', icon: '🚃' },
  { to: '/exchange', label: '환율', icon: '💴' },
]

export default function BottomNav() {
  return (
    // lg: PC에서 숨김
    <nav className="
      fixed bottom-0 left-0 right-0 z-50
      bg-card border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]
      lg:hidden
    ">
      <ul className="flex items-center justify-around px-1 h-16">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 min-h-[44px] w-full rounded-xl transition-colors ${
                  isActive ? 'text-primary' : 'text-text-sub'
                }`
              }
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      {/* iOS safe area 여백 */}
      <div style={{ height: 'env(safe-area-inset-bottom)' }} />
    </nav>
  )
}
