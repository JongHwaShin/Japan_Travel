import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import HeroBanner from '../components/home/HeroBanner'
import LogsSection from '../components/home/LogsSection'
import ExchangeWidget from '../components/home/ExchangeWidget'

const CITY_IMAGES = {
  '후쿠오카': 'https://images.unsplash.com/photo-1679230708086-2b10acf31074?w=800&q=80&fit=crop',
  '오사카':   'https://plus.unsplash.com/premium_photo-1733342572346-5420c95f7556?w=800&q=80&fit=crop',
  '도쿄':     'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800&q=80&fit=crop',
  '교토':     'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80&fit=crop',
  '삿포로':   'https://images.unsplash.com/photo-1696053066632-3ef25f7bb0eb?w=800&q=80&fit=crop',
  '요코하마': 'https://images.unsplash.com/photo-1737559890706-bbcc6d5945c1?w=800&q=80&fit=crop',
  '나고야':   'https://images.unsplash.com/photo-1719805053349-e8974bb0c60d?w=800&q=80&fit=crop',
}

const FALLBACK_REGIONS = [
  { regionId: 1, nameKo: '후쿠오카', nameJp: '福岡' },
  { regionId: 2, nameKo: '오사카',   nameJp: '大阪' },
  { regionId: 3, nameKo: '도쿄',     nameJp: '東京' },
  { regionId: 4, nameKo: '교토',     nameJp: '京都' },
  { regionId: 5, nameKo: '삿포로',   nameJp: '札幌' },
]

export default function HomePage() {
  const navigate = useNavigate()

  const { data: regions = FALLBACK_REGIONS } = useQuery({
    queryKey: ['regions'],
    queryFn: () => api.get('/regions').then((r) => r.data.data),
    staleTime: 1000 * 60 * 30,
  })

  return (
    <div className="pb-20 lg:pb-8">

      {/* 1. 히어로 배너 (헤더 높이 상쇄) */}
      <div className="mt-14 lg:mt-16">
        <HeroBanner />
      </div>

      {/* 2. 도시 선택 카드 그리드 */}
      <div className="mt-7 px-4 md:px-6 lg:px-0">
        <h2 className="text-lg font-bold text-text-main mb-4">도시 선택</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {regions.map(({ regionId, nameKo, nameJp }) => (
            <button
              key={regionId}
              onClick={() => navigate(`/city/${regionId}`)}
              className="group relative overflow-hidden rounded-2xl bg-gray-200
                         hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              style={{ aspectRatio: '4/3' }}
            >
              {CITY_IMAGES[nameKo] && (
                <img
                  src={CITY_IMAGES[nameKo]}
                  alt={nameKo}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute bottom-3 left-3 text-left">
                {nameJp && (
                  <p className="text-white/75 text-xs leading-tight">{nameJp}</p>
                )}
                <p className="text-white font-bold text-base leading-tight">{nameKo}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 구분선 */}
      <div className="my-7 mx-4 md:mx-6 lg:mx-0 border-t border-gray-100" />

      {/* 3. 최근 여행일기 */}
      <LogsSection />

      {/* 구분선 */}
      <div className="my-7 mx-4 md:mx-6 lg:mx-0 border-t border-gray-100" />

      {/* 4. 환율 위젯 */}
      <div className="px-4 md:px-6 lg:px-0">
        <h2 className="text-lg font-bold text-text-main mb-4">오늘의 환율</h2>
        <ExchangeWidget />
      </div>

      {/* 하단 여백 (바텀탭 가림 방지) */}
      <div className="h-6" />
    </div>
  )
}
