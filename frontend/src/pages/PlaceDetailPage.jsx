import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import Loading from '../components/Loading'

const CATEGORY_COLORS = {
  맛집:   'bg-orange-100 text-orange-600',
  카페:   'bg-yellow-100 text-yellow-600',
  관광지: 'bg-blue-100 text-blue-600',
  쇼핑:   'bg-pink-100 text-pink-600',
}

// ─── 이미지 슬라이더 ─────────────────────────────────────────────────────────

function ImageSlider({ images, name }) {
  const [current, setCurrent] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 md:h-80 bg-gray-100 flex items-center justify-center text-6xl">
        🗾
      </div>
    )
  }

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1))

  return (
    <div className="relative w-full h-64 md:h-80 overflow-hidden bg-gray-100">
      {images.map((img, idx) => (
        <img
          key={img.imageId}
          src={img.imageUrl}
          alt={`${name} ${idx + 1}`}
          loading={idx === 0 ? 'eager' : 'lazy'}
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            idx === current ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {images.length > 1 && (
        <>
          {/* 이전/다음 버튼 */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60
                       rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 19-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60
                       rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
            </svg>
          </button>

          {/* 인디케이터 */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`rounded-full transition-all duration-200 ${
                  idx === current ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── 정보 행 ─────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, children }) {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="flex-shrink-0 w-5 h-5 mt-0.5 text-text-sub">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-sub mb-0.5">{label}</p>
        <div className="text-sm text-text-main">{children}</div>
      </div>
    </div>
  )
}

// ─── 메인 페이지 ────────────────────────────────────────────────────────────

export default function PlaceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: place, isLoading, isError } = useQuery({
    queryKey: ['place', id],
    queryFn: () => api.get(`/places/${id}`).then((r) => r.data.data),
  })

  // 구글맵 링크 생성
  const mapsUrl = place
    ? place.latitude && place.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address ?? place.nameKo)}`
    : null

  return (
    <div className="pb-24 lg:pb-8">

      {/* 헤더 여백 */}
      <div className="h-14 lg:h-16" />

      {isLoading && <Loading fullScreen />}

      {isError && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <span className="text-5xl mb-4">😢</span>
          <p className="text-sm text-text-sub">장소 정보를 불러올 수 없습니다.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-sm text-primary hover:underline">
            뒤로 가기
          </button>
        </div>
      )}

      {place && (
        <>
          {/* 이미지 슬라이더 */}
          <div className="relative">
            <ImageSlider images={place.images} name={place.nameKo} />

            {/* 뒤로가기 버튼 (이미지 위) */}
            <button
              onClick={() => navigate(-1)}
              className="absolute top-3 left-3 w-9 h-9 bg-black/40 hover:bg-black/60
                         rounded-full flex items-center justify-center text-white transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m15 19-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* 콘텐츠 */}
          <div className="px-4 md:px-6 lg:px-0">

            {/* 장소명 + 뱃지 */}
            <div className="pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-text-main leading-tight">{place.nameKo}</h1>
                  {place.nameJp && (
                    <p className="text-sm text-text-sub mt-0.5">{place.nameJp}</p>
                  )}
                  {place.regionNameKo && (
                    <p className="text-xs text-text-sub mt-1">📍 {place.regionNameKo}</p>
                  )}
                </div>
                <span className={`flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
                  CATEGORY_COLORS[place.category] ?? 'bg-gray-100 text-gray-600'
                }`}>
                  {place.category}
                </span>
              </div>

              {/* 평점 */}
              <div className="flex items-center gap-4 mt-3">
                {place.rating != null && (
                  <div className="flex items-center gap-1">
                    <span className="text-base">⭐</span>
                    <span className="text-base font-bold text-text-main">
                      {Number(place.rating).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 상세 정보 */}
            <div className="py-2">
              {place.openHours && (
                <InfoRow
                  icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
                  label="영업시간"
                >
                  {place.openHours}
                </InfoRow>
              )}

              {place.address && (
                <InfoRow
                  icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>}
                  label="주소"
                >
                  <span>{place.address}</span>
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 ml-2 text-secondary text-xs font-medium hover:underline"
                    >
                      지도 보기
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  )}
                </InfoRow>
              )}
            </div>

            {/* 설명 */}
            {place.description && (
              <div className="pt-3 border-t border-gray-100">
                <h2 className="text-sm font-bold text-text-main mb-2">소개</h2>
                <p className="text-sm text-text-sub leading-relaxed whitespace-pre-line">
                  {place.description}
                </p>
              </div>
            )}

            {/* 하단 뒤로가기 버튼 */}
            <button
              onClick={() => navigate(-1)}
              className="mt-8 flex items-center gap-1.5 text-sm text-text-sub hover:text-text-main transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m15 19-7-7 7-7" />
              </svg>
              목록으로 돌아가기
            </button>

          </div>
        </>
      )}
    </div>
  )
}
