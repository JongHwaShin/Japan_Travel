import { Link } from 'react-router-dom'

function formatDate(dateString) {
  if (!dateString) return ''
  const d = new Date(dateString)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

/**
 * API TravelLogListResponse 필드를 그대로 받는다.
 * @param {{
 *   logId: number,
 *   title: string,
 *   nickname: string,
 *   regionNameKo: string,
 *   travelDate: string,
 *   viewCount: number,
 *   createdAt: string
 * }} props
 */
export default function LogCard({ logId, title, nickname, regionNameKo, travelDate, viewCount, createdAt }) {
  return (
    <Link
      to={`/logs/${logId}`}
      className="flex gap-3 bg-card rounded-2xl shadow-sm p-3.5
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* 썸네일 플레이스홀더 (목록 API에 이미지 없음) */}
      <div className="flex-shrink-0 w-[88px] h-[88px] rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center text-3xl">
        ✈️
      </div>

      <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
        <div>
          <h3 className="font-bold text-text-main text-sm leading-snug line-clamp-2">{title}</h3>
          {regionNameKo && (
            <p className="text-xs text-secondary mt-1 font-medium">📍 {regionNameKo}</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-2 text-xs text-text-sub">
            <span className="font-medium truncate max-w-[80px]">{nickname}</span>
            {travelDate && <span>· {formatDate(travelDate)}</span>}
          </div>
          <div className="flex items-center gap-1 text-xs text-text-sub flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            <span>{viewCount ?? 0}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
