import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function HeroBanner() {
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    const q = inputRef.current?.value.trim()
    if (q) navigate(`/places?q=${encodeURIComponent(q)}`)
  }

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: '300px' }}>
      {/* 배경 그라디언트 (일본 일출 느낌) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF9F6B 30%, #FFD4B8 55%, #B8D4F0 80%, #2D9CDB 100%)',
        }}
      />

      {/* 원형 장식 - 후지산 실루엣 느낌 */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-white/8 blur-3xl" />
      <div className="absolute top-4 right-8 w-20 h-20 rounded-full bg-white/20 blur-xl" />

      {/* 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-14 md:py-20 lg:py-24">
        <span className="inline-block text-sm font-semibold text-white/90 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4 tracking-wide">
          🗾 Japan Travel Guide
        </span>

        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight drop-shadow-sm">
          당신의 일본 여행을<br />특별하게
        </h1>
        <p className="mt-3 text-sm md:text-base text-white/85 font-medium">
          맛집, 관광지, 여행일기 모두 여기서
        </p>

        {/* 검색바 */}
        <form onSubmit={handleSearch} className="mt-7 w-full max-w-md">
          <div className="flex items-center bg-white rounded-2xl shadow-lg px-4 h-12">
            <svg className="w-4 h-4 text-text-sub flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="도시명, 맛집명으로 검색..."
              className="flex-1 min-w-0 mx-2 text-sm text-text-main placeholder:text-text-sub outline-none bg-transparent h-full"
            />
            <button
              type="submit"
              className="flex-shrink-0 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-orange-500 transition-colors whitespace-nowrap"
            >
              검색
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
