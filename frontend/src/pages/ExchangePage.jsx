import { useState, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

// ─── 상수 ──────────────────────────────────────────────────────────────────

const QUICK_JPY = [1_000, 5_000, 10_000, 50_000]

// ─── 유틸 ──────────────────────────────────────────────────────────────────

function formatKrw(n) {
  if (!n && n !== 0) return ''
  return Math.round(n).toLocaleString('ko-KR')
}

function formatJpy(n) {
  if (!n && n !== 0) return ''
  return Math.round(n).toLocaleString('ja-JP')
}

function formatDateTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())} 기준`
}

// ─── 환율 헤더 ──────────────────────────────────────────────────────────────

function RateHeader({ rate, updatedAt, isLoading, cached }) {
  const krwPer100Jpy = rate ? Math.round(100 / rate) : null

  return (
    <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl p-5 border border-secondary/15">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-secondary mb-1">
            실시간 환율 {cached && <span className="text-text-sub font-normal">(캐시)</span>}
          </p>
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-9 w-48 bg-secondary/20 rounded-lg" />
              <div className="h-3 w-32 bg-secondary/10 rounded" />
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text-main">
                  100엔
                </span>
                <span className="text-xl text-text-sub">=</span>
                <span className="text-3xl font-bold text-secondary">
                  {krwPer100Jpy != null ? `${krwPer100Jpy.toLocaleString()}원` : '-'}
                </span>
              </div>
              {updatedAt && (
                <p className="text-[11px] text-text-sub mt-1.5">{formatDateTime(updatedAt)}</p>
              )}
            </>
          )}
        </div>
        <span className="text-4xl">💴</span>
      </div>

      {/* 세부 환율 */}
      {!isLoading && rate != null && (
        <div className="mt-4 pt-4 border-t border-secondary/15 grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-xs text-text-sub mb-0.5">1원 →</p>
            <p className="text-sm font-bold text-text-main">{Number(rate).toFixed(4)} 엔</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-sub mb-0.5">1엔 →</p>
            <p className="text-sm font-bold text-text-main">
              {(1 / Number(rate)).toFixed(2)} 원
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 계산기 ─────────────────────────────────────────────────────────────────

function Calculator({ rate }) {
  const [krwRaw, setKrwRaw] = useState('')  // 원화 입력 (숫자 문자열)
  const [jpyRaw, setJpyRaw] = useState('')  // 엔화 입력 (숫자 문자열)
  const [lastEdited, setLastEdited] = useState(null) // 'krw' | 'jpy'

  // 원화 → 엔화
  const jpyResult = lastEdited === 'krw' && krwRaw !== '' && rate
    ? Number(krwRaw.replace(/,/g, '')) * Number(rate)
    : null

  // 엔화 → 원화
  const krwResult = lastEdited === 'jpy' && jpyRaw !== '' && rate
    ? Number(jpyRaw.replace(/,/g, '')) / Number(rate)
    : null

  const handleKrwChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    setKrwRaw(raw ? Number(raw).toLocaleString() : '')
    setJpyRaw('')
    setLastEdited('krw')
  }

  const handleJpyChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    setJpyRaw(raw ? Number(raw).toLocaleString() : '')
    setKrwRaw('')
    setLastEdited('jpy')
  }

  const handleQuickJpy = useCallback((jpy) => {
    setJpyRaw(jpy.toLocaleString())
    setKrwRaw('')
    setLastEdited('jpy')
  }, [])

  const handleReset = () => {
    setKrwRaw('')
    setJpyRaw('')
    setLastEdited(null)
  }

  const disabled = !rate

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* 타이틀 바 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
        <h2 className="text-sm font-bold text-text-main">환율 계산기</h2>
        <button
          onClick={handleReset}
          className="text-xs text-text-sub hover:text-text-main transition-colors"
        >
          초기화
        </button>
      </div>

      <div className="p-4 space-y-4">

        {/* 원화 → 엔화 */}
        <div>
          <label className="text-xs font-semibold text-text-sub mb-1.5 block">원화 (KRW)</label>
          <div className={`flex items-center border rounded-xl px-4 h-14 gap-2 transition-colors ${
            lastEdited === 'krw' ? 'border-primary bg-orange-50/40' : 'border-gray-200 bg-white'
          }`}>
            <span className="text-lg text-text-sub flex-shrink-0">🇰🇷</span>
            <input
              type="text"
              inputMode="numeric"
              value={krwRaw}
              onChange={handleKrwChange}
              disabled={disabled}
              placeholder="원화 입력"
              className="flex-1 text-xl font-bold text-text-main outline-none bg-transparent
                         placeholder:text-gray-300 placeholder:font-normal placeholder:text-base"
            />
            {krwRaw && <span className="text-sm text-text-sub flex-shrink-0">원</span>}
          </div>

          {/* 원화 → 엔화 결과 */}
          {lastEdited === 'krw' && jpyResult != null && (
            <div className="mt-2 flex items-center gap-2 px-4">
              <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
              </svg>
              <span className="text-base font-bold text-primary">
                ≈ {formatJpy(jpyResult)} 엔
              </span>
            </div>
          )}
        </div>

        {/* 구분 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-dashed border-gray-200" />
          <span className="text-xl text-gray-300">⇅</span>
          <div className="flex-1 border-t border-dashed border-gray-200" />
        </div>

        {/* 엔화 → 원화 */}
        <div>
          <label className="text-xs font-semibold text-text-sub mb-1.5 block">엔화 (JPY)</label>
          <div className={`flex items-center border rounded-xl px-4 h-14 gap-2 transition-colors ${
            lastEdited === 'jpy' ? 'border-secondary bg-blue-50/40' : 'border-gray-200 bg-white'
          }`}>
            <span className="text-lg text-text-sub flex-shrink-0">🇯🇵</span>
            <input
              type="text"
              inputMode="numeric"
              value={jpyRaw}
              onChange={handleJpyChange}
              disabled={disabled}
              placeholder="엔화 입력"
              className="flex-1 text-xl font-bold text-text-main outline-none bg-transparent
                         placeholder:text-gray-300 placeholder:font-normal placeholder:text-base"
            />
            {jpyRaw && <span className="text-sm text-text-sub flex-shrink-0">엔</span>}
          </div>

          {/* 엔화 → 원화 결과 */}
          {lastEdited === 'jpy' && krwResult != null && (
            <div className="mt-2 flex items-center gap-2 px-4">
              <svg className="w-4 h-4 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
              </svg>
              <span className="text-base font-bold text-secondary">
                ≈ {formatKrw(krwResult)} 원
              </span>
            </div>
          )}
        </div>

        {disabled && (
          <p className="text-center text-xs text-text-sub py-2">환율 정보를 불러오는 중...</p>
        )}
      </div>
    </div>
  )
}

// ─── 빠른 환산 ──────────────────────────────────────────────────────────────

function QuickConvert({ rate }) {
  return (
    <div className="bg-card rounded-2xl shadow-sm border border-gray-100 p-4">
      <h2 className="text-sm font-bold text-text-main mb-3">빠른 환산</h2>

      {!rate ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {QUICK_JPY.map((jpy) => {
            const krw = Math.round(jpy / Number(rate))
            return (
              <div
                key={jpy}
                className="flex flex-col items-center justify-center bg-gray-50 hover:bg-orange-50
                           border border-gray-100 hover:border-primary/30 rounded-xl py-3.5 px-3
                           transition-colors cursor-default"
              >
                <p className="text-base font-bold text-text-main tabular-nums">
                  {jpy.toLocaleString()}엔
                </p>
                <p className="text-xs font-semibold text-primary mt-1 tabular-nums">
                  ≈ {krw.toLocaleString()}원
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── 메인 페이지 ────────────────────────────────────────────────────────────

export default function ExchangePage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['exchange', 'KRW', 'JPY'],
    queryFn: () =>
      api.get('/api/exchange', { params: { from: 'KRW', to: 'JPY' } }).then((r) => r.data.data),
    staleTime: 1000 * 60 * 10, // 10분
    refetchOnWindowFocus: true,
  })

  const rate = data?.rate != null ? Number(data.rate) : null

  return (
    <div className="pb-24 lg:pb-8">
      <div className="h-14 lg:h-16" />

      {/* 헤더 */}
      <div className="px-4 md:px-6 lg:px-0 pt-5 pb-4">
        <h1 className="text-xl font-bold text-text-main">환율계산기 💴</h1>
        <p className="text-xs text-text-sub mt-0.5">KRW ↔ JPY 실시간 환율</p>
      </div>

      <div className="px-4 md:px-6 lg:px-0 space-y-4">

        {/* 에러 */}
        {isError && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
            <span className="text-xl">😢</span>
            <p className="text-sm text-red-600">환율 정보를 불러오지 못했습니다.</p>
          </div>
        )}

        {/* 현재 환율 */}
        <RateHeader
          rate={rate}
          updatedAt={data?.updatedAt}
          isLoading={isLoading}
          cached={data?.cached}
        />

        {/* 계산기 */}
        <Calculator rate={rate} />

        {/* 빠른 환산 */}
        <QuickConvert rate={rate} />

        {/* 안내 */}
        <p className="text-center text-xs text-text-sub pb-2">
          환율은 10분마다 갱신됩니다. 실제 환전 시 은행 수수료가 추가될 수 있습니다.
        </p>

      </div>
    </div>
  )
}
