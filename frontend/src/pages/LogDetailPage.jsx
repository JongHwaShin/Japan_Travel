import { useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import Loading from '../components/Loading'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

// ─── 좋아요 버튼 ────────────────────────────────────────────────────────────

function LikeButton({ logId, liked, likeCount, isLoggedIn }) {
  const queryClient = useQueryClient()
  const [animating, setAnimating] = useState(false)

  const { mutate: toggleLike, isPending } = useMutation({
    mutationFn: () => api.post(`/logs/${logId}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['log', String(logId)] })
    },
  })

  const handleClick = () => {
    if (!isLoggedIn || isPending) return
    setAnimating(true)
    toggleLike()
  }

  return (
    <button
      onClick={handleClick}
      disabled={!isLoggedIn || isPending}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border transition-colors ${
        liked
          ? 'bg-red-50 border-red-200 text-red-500'
          : 'bg-white border-gray-200 text-text-sub hover:border-red-200 hover:text-red-400'
      } ${!isLoggedIn ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <span
        className={animating ? 'animate-like' : ''}
        onAnimationEnd={() => setAnimating(false)}
        style={{ display: 'inline-block' }}
      >
        {liked ? '❤️' : '🤍'}
      </span>
      <span className="text-sm font-semibold">{likeCount}</span>
    </button>
  )
}

// ─── 댓글 섹션 ──────────────────────────────────────────────────────────────

function CommentSection({ logId, comments, isLoggedIn }) {
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const textareaRef = useRef(null)

  const { mutate: addComment, isPending } = useMutation({
    mutationFn: (text) => api.post(`/logs/${logId}/comments`, { content: text }),
    onSuccess: () => {
      setContent('')
      queryClient.invalidateQueries({ queryKey: ['log', String(logId)] })
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || isPending) return
    addComment(trimmed)
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <h2 className="text-base font-bold text-text-main mb-4">
        댓글 <span className="text-text-sub font-normal text-sm">{comments.length}</span>
      </h2>

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <p className="text-sm text-text-sub text-center py-6">
          아직 댓글이 없어요. 첫 댓글을 남겨보세요!
        </p>
      ) : (
        <ul className="space-y-4 mb-6">
          {comments.map((c) => (
            <li key={c.commentId} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                {c.nickname?.[0] ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-text-main">{c.nickname}</span>
                  <span className="text-xs text-text-sub">{formatDate(c.createdAt)}</span>
                </div>
                <p className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">{c.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 댓글 작성 */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 입력해주세요..."
            rows={2}
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none
                       outline-none focus:border-primary transition-colors placeholder:text-text-sub"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e)
            }}
          />
          <button
            type="submit"
            disabled={!content.trim() || isPending}
            className="self-end flex-shrink-0 bg-primary text-white text-sm font-semibold
                       px-4 h-10 rounded-xl hover:bg-orange-500 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? '...' : '등록'}
          </button>
        </form>
      ) : (
        <div className="text-center py-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-text-sub">
            <Link to="/login" className="text-primary font-semibold hover:underline">로그인</Link>
            {' '}후 댓글을 남길 수 있어요
          </p>
        </div>
      )}
    </div>
  )
}

// ─── 이미지 갤러리 ───────────────────────────────────────────────────────────

function ImageGallery({ images }) {
  if (!images || images.length === 0) return null

  return (
    <div className="mt-6">
      <div className={`grid gap-2 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {images.map((img, idx) => (
          <img
            key={img.imageId}
            src={img.imageUrl}
            alt={`이미지 ${idx + 1}`}
            loading="lazy"
            decoding="async"
            className={`w-full rounded-xl object-cover ${
              images.length === 1 ? 'h-64' : 'h-40'
            } ${images.length === 3 && idx === 0 ? 'col-span-2 h-52' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

// ─── 메인 페이지 ────────────────────────────────────────────────────────────

export default function LogDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isLoggedIn, user } = useAuthStore()

  const { data: log, isLoading, isError } = useQuery({
    queryKey: ['log', id],
    queryFn: () => api.get(`/logs/${id}`).then((r) => r.data.data),
  })

  const { mutate: deleteLog, isPending: isDeleting } = useMutation({
    mutationFn: () => api.delete(`/logs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] })
      navigate('/logs', { replace: true })
    },
  })

  const isOwner = isLoggedIn && log && user?.id === log.userId

  const handleDelete = () => {
    if (!window.confirm('정말 삭제하시겠어요?')) return
    deleteLog()
  }

  return (
    <div className="pb-24 lg:pb-8">
      <div className="h-14 lg:h-16" />

      {isLoading && <Loading fullScreen />}

      {isError && (
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <span className="text-5xl mb-4">😢</span>
          <p className="text-sm text-text-sub">일기를 불러올 수 없습니다.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-sm text-primary hover:underline">
            뒤로 가기
          </button>
        </div>
      )}

      {log && (
        <div className="px-4 md:px-6 lg:px-0">

          {/* 뒤로가기 + 수정/삭제 */}
          <div className="flex items-center justify-between pt-5 mb-5">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm text-text-sub hover:text-text-main transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m15 19-7-7 7-7" />
              </svg>
              목록
            </button>

            {isOwner && (
              <div className="flex items-center gap-2">
                <Link
                  to={`/logs/${id}/edit`}
                  className="text-sm text-text-sub hover:text-primary transition-colors"
                >
                  수정
                </Link>
                <span className="text-gray-200">|</span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-sm text-text-sub hover:text-red-500 transition-colors disabled:opacity-40"
                >
                  삭제
                </button>
              </div>
            )}
          </div>

          {/* 카테고리 뱃지 / 지역 */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {log.regionNameKo && (
              <span className="text-xs font-semibold text-secondary bg-blue-50 px-3 py-1 rounded-full">
                📍 {log.regionNameKo}
              </span>
            )}
            {!log.isPublic && (
              <span className="text-xs font-semibold text-text-sub bg-gray-100 px-3 py-1 rounded-full">
                🔒 비공개
              </span>
            )}
          </div>

          {/* 제목 */}
          <h1 className="text-xl font-bold text-text-main leading-tight mb-4">{log.title}</h1>

          {/* 작성자 정보 */}
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {log.nickname?.[0] ?? '?'}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-main">{log.nickname}</p>
                <p className="text-xs text-text-sub">
                  {log.travelDate ? `✈️ ${formatDate(log.travelDate)}` : formatDate(log.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-text-sub">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              {log.viewCount}
            </div>
          </div>

          {/* 본문 */}
          <div className="prose-like">
            <p className="text-[15px] text-text-main leading-[1.85] whitespace-pre-line">
              {log.content}
            </p>
          </div>

          {/* 이미지 갤러리 */}
          <ImageGallery images={log.images} />

          {/* 좋아요 버튼 */}
          <div className="flex justify-center mt-8">
            <LikeButton
              logId={log.logId}
              liked={log.liked}
              likeCount={log.likeCount}
              isLoggedIn={isLoggedIn}
            />
          </div>
          {!isLoggedIn && (
            <p className="text-center text-xs text-text-sub mt-2">
              <Link to="/login" className="text-primary hover:underline">로그인</Link> 후 좋아요를 누를 수 있어요
            </p>
          )}

          {/* 댓글 */}
          <CommentSection
            logId={log.logId}
            comments={log.comments ?? []}
            isLoggedIn={isLoggedIn}
          />

        </div>
      )}
    </div>
  )
}
