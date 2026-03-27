import { useState } from 'react'
import HeroBanner from '../components/home/HeroBanner'
import RegionTabs from '../components/home/RegionTabs'
import PlacesSection from '../components/home/PlacesSection'
import LogsSection from '../components/home/LogsSection'
import ExchangeWidget from '../components/home/ExchangeWidget'

export default function HomePage() {
  const [selectedRegionId, setSelectedRegionId] = useState(null)

  return (
    <div className="pb-20 lg:pb-8">

      {/* 1. 히어로 배너 (헤더 높이 pt-14 상쇄 포함) */}
      <div className="mt-14 lg:mt-16">
        <HeroBanner />
      </div>

      {/* 2. 지역 탭 */}
      <div className="mt-5">
        <RegionTabs selectedId={selectedRegionId} onSelect={setSelectedRegionId} />
      </div>

      {/* 3. 추천 맛집 & 관광지 */}
      <div className="mt-6 px-0 lg:px-0">
        <PlacesSection regionId={selectedRegionId} />
      </div>

      {/* 구분선 */}
      <div className="my-7 mx-4 md:mx-6 lg:mx-0 border-t border-gray-100" />

      {/* 4. 최근 여행일기 */}
      <LogsSection />

      {/* 구분선 */}
      <div className="my-7 mx-4 md:mx-6 lg:mx-0 border-t border-gray-100" />

      {/* 5. 환율 위젯 */}
      <div className="px-4 md:px-6 lg:px-0">
        <h2 className="text-lg font-bold text-text-main mb-4">오늘의 환율</h2>
        <ExchangeWidget />
      </div>

      {/* 하단 여백 (바텀탭 가림 방지) */}
      <div className="h-6" />
    </div>
  )
}
