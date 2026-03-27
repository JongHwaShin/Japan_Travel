import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'
import LogCard from '../LogCard'
import Loading from '../Loading'

export default function LogsSection() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['logs', 'home'],
    queryFn: () =>
      api.get('/logs', { params: { size: 4, sort: 'createdAt,desc' } }).then((r) => r.data.data),
  })

  const logs = data?.content ?? data ?? []

  return (
    <section>
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-4 px-4 md:px-6 lg:px-0">
        <div>
          <h2 className="text-lg font-bold text-text-main">최근 여행일기</h2>
          <p className="text-xs text-text-sub mt-0.5">여행자들의 생생한 이야기</p>
        </div>
        <Link
          to="/logs"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 md:px-6 lg:px-0">
          {logs.length === 0 ? (
            <p className="col-span-2 text-center text-sm text-text-sub py-8">
              아직 작성된 여행일기가 없습니다.
            </p>
          ) : (
            logs.slice(0, 4).map((log) => <LogCard key={log.logId} {...log} />)
          )}
        </div>
      )}
    </section>
  )
}
