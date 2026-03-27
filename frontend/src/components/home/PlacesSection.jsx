import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'
import PlaceCard from '../PlaceCard'
import Loading from '../Loading'

/**
 * @param {{ regionId: number|null }} props
 */
export default function PlacesSection({ regionId }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['places', 'home', regionId],
    queryFn: () =>
      api
        .get('/places', { params: { regionId: regionId ?? undefined, size: 6 } })
        .then((r) => r.data.data),
  })

  const places = data?.content ?? data ?? []

  return (
    <section>
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-4 px-4 md:px-6 lg:px-0">
        <div>
          <h2 className="text-lg font-bold text-text-main">추천 맛집 & 관광지</h2>
          <p className="text-xs text-text-sub mt-0.5">현지인이 추천하는 스팟</p>
        </div>
        <Link
          to="/places"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          더보기
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </div>

      {isLoading && <Loading />}

      {isError && (
        <p className="text-center text-sm text-text-sub py-8">데이터를 불러올 수 없습니다.</p>
      )}

      {!isLoading && !isError && (
        <>
          {/* 모바일: 가로 스크롤 */}
          <div className="lg:hidden">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide touch-scroll px-4 md:px-6 pb-2">
              {places.length === 0 ? (
                <p className="text-sm text-text-sub py-6 px-2">등록된 장소가 없습니다.</p>
              ) : (
                places.map((place) => (
                  <div key={place.placeId} className="flex-shrink-0 w-[200px]">
                    <PlaceCard {...place} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PC: 3열 그리드 */}
          <div className="hidden lg:grid grid-cols-3 gap-4">
            {places.length === 0 ? (
              <p className="col-span-3 text-center text-sm text-text-sub py-8">등록된 장소가 없습니다.</p>
            ) : (
              places.map((place) => <PlaceCard key={place.placeId} {...place} />)
            )}
          </div>
        </>
      )}
    </section>
  )
}
