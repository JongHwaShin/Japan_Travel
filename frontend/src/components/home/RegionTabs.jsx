import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'

// API 장애 시 보여줄 폴백 지역 목록
const FALLBACK_REGIONS = [
  { id: 1, name: '후쿠오카' },
  { id: 2, name: '오사카' },
  { id: 3, name: '도쿄' },
  { id: 4, name: '교토' },
  { id: 5, name: '삿포로' },
]

const ALL_TAB = { id: null, name: '전체' }

/**
 * @param {{ selectedId: number|null, onSelect: (id: number|null) => void }} props
 */
export default function RegionTabs({ selectedId, onSelect }) {
  const { data: regions = FALLBACK_REGIONS } = useQuery({
    queryKey: ['regions'],
    queryFn: () => api.get('/regions').then((r) => r.data.data),
    staleTime: 1000 * 60 * 30, // 지역 목록은 30분 캐시
  })

  const tabs = [ALL_TAB, ...regions]

  return (
    <div className="relative">
      <ul className="flex gap-2 overflow-x-auto scrollbar-hide px-4 md:px-6 lg:px-0 py-1">
        {tabs.map(({ id, name }) => {
          const isActive = id === selectedId
          return (
            <li key={id ?? 'all'} className="flex-shrink-0">
              <button
                onClick={() => onSelect(id)}
                className={`min-h-[36px] px-4 rounded-full text-sm font-semibold transition-colors border ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-text-sub border-gray-200 hover:border-primary hover:text-primary'
                }`}
              >
                {name}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
