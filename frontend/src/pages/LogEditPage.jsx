import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import Loading from '../components/Loading'

// ─── 메인 페이지 ────────────────────────────────────────────────────────────

export default function LogEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isLoggedIn, user } = useAuthStore()
  const textareaRef = useRef(null)

  // 기존 일기 불러오기
  const { data: log, isLoading } = useQuery({
    queryKey: ['log', id],
    queryFn: () => api.get(`/api/logs/${id}`).then((r) => r.data.data),
  })

  // 지역 목록
  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => api.get('/api/regions').then((r) => r.data.data),
    staleTime: 1000 * 60 * 30,
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      content: '',
      regionId: '',
      travelDate: '',
      isPublic: true,
    },
  })

  // 불러온 데이터로 폼 초기화
  useEffect(() => {
    if (!log) return
    reset({
      title: log.title ?? '',
      content: log.content ?? '',
      regionId: log.regionId ? String(log.regionId) : '',
      travelDate: log.travelDate ? log.travelDate.slice(0, 10) : '',
      isPublic: log.isPublic ?? true,
    })
  }, [log, reset])

  // 본인 글 아닐 때 리다이렉트
  useEffect(() => {
    if (!log) return
    const isOwner =
      (user?.id != null && user.id === log.userId) ||
      (user?.nickname != null && user.nickname === log.nickname)
    if (isLoggedIn && !isOwner) {
      navigate('/logs', { replace: true })
    }
  }, [log, user, isLoggedIn, navigate])

  const { mutate: submit, isPending, isError, error } = useMutation({
    mutationFn: (data) =>
      api.put(`/api/logs/${id}`, {
        title: data.title,
        content: data.content,
        regionId: data.regionId ? Number(data.regionId) : null,
        travelDate: data.travelDate || null,
        isPublic: data.isPublic,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['log', id] })
      queryClient.invalidateQueries({ queryKey: ['logs'] })
      navigate(`/logs/${id}`, { replace: true })
    },
  })

  // 마크다운 툴바
  const insertMarkdown = (syntax, isPrefix = false) => {
    const ta = textareaRef.current
    if (!ta) return
    const { selectionStart: start, selectionEnd: end } = ta
    const current = getValues('content')
    let next
    if (isPrefix) {
      const lineStart = current.lastIndexOf('\n', start - 1) + 1
      next = current.slice(0, lineStart) + syntax + current.slice(lineStart)
    } else {
      const selected = current.slice(start, end)
      next = current.slice(0, start) + syntax + selected + syntax + current.slice(end)
    }
    setValue('content', next, { shouldDirty: true })
    setTimeout(() => {
      ta.selectionStart = isPrefix ? start + syntax.length : start + syntax.length
      ta.selectionEnd = isPrefix ? end + syntax.length : end + (current.slice(start, end)).length + syntax.length
      ta.focus()
    }, 0)
  }

  const serverError = error?.response?.data?.message ?? (isError ? '수정에 실패했습니다.' : null)

  if (isLoading) return <Loading fullScreen />

  return (
    <div className="pb-24 lg:pb-8">
      <div className="h-14 lg:h-16" />

      <form onSubmit={handleSubmit(submit)}>

        {/* 상단 바 */}
        <div className="flex items-center justify-between px-4 md:px-6 lg:px-0 pt-5 pb-4 border-b border-gray-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-text-sub hover:text-text-main transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-white text-sm font-semibold px-5 h-9 rounded-xl
                       hover:bg-orange-500 transition-colors disabled:opacity-50"
          >
            {isPending ? '저장 중...' : '저장하기'}
          </button>
        </div>

        <div className="px-4 md:px-6 lg:px-0 pt-5 space-y-5">

          {/* 제목 */}
          <div>
            <input
              type="text"
              placeholder="제목을 입력해주세요"
              className={`w-full text-xl font-bold text-text-main placeholder:text-gray-300
                          outline-none border-b-2 pb-2 transition-colors bg-transparent
                          ${errors.title ? 'border-red-400' : 'border-gray-100 focus:border-primary'}`}
              {...register('title', {
                required: '제목을 입력해주세요.',
                maxLength: { value: 200, message: '제목은 200자 이하여야 합니다.' },
              })}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          {/* 메타 정보 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            {/* 지역 */}
            <div>
              <label className="block text-xs font-medium text-text-sub mb-1">지역</label>
              <select
                className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm
                           text-text-main outline-none focus:border-primary transition-colors bg-white"
                {...register('regionId')}
              >
                <option value="">선택 안함</option>
                {regions.map((r) => (
                  <option key={r.regionId} value={r.regionId}>{r.nameKo}</option>
                ))}
              </select>
            </div>

            {/* 여행 날짜 */}
            <div>
              <label className="block text-xs font-medium text-text-sub mb-1">여행 날짜</label>
              <input
                type="date"
                className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm
                           text-text-main outline-none focus:border-primary transition-colors"
                {...register('travelDate')}
              />
            </div>

            {/* 공개 여부 */}
            <div className="col-span-2 md:col-span-2 flex items-end">
              <Controller
                name="isPublic"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center gap-3 cursor-pointer select-none h-10">
                    <div
                      onClick={() => field.onChange(!field.value)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        field.value ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
                                    transition-transform ${field.value ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                    </div>
                    <span className="text-sm text-text-main">
                      {field.value ? '🌏 전체 공개' : '🔒 비공개'}
                    </span>
                  </label>
                )}
              />
            </div>
          </div>

          {/* 마크다운 툴바 */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              {[
                { label: 'B', title: '굵게', action: () => insertMarkdown('**') },
                { label: 'I', title: '기울임', action: () => insertMarkdown('_') },
                { label: 'H1', title: '제목', action: () => insertMarkdown('# ', true) },
                { label: '❝', title: '인용', action: () => insertMarkdown('> ', true) },
              ].map(({ label, title, action }) => (
                <button
                  key={label}
                  type="button"
                  title={title}
                  onClick={action}
                  className="px-2.5 py-1 text-xs font-bold text-text-sub bg-gray-50 hover:bg-gray-100
                             border border-gray-200 rounded-md transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>

            <textarea
              ref={(el) => {
                textareaRef.current = el
                register('content', { required: '내용을 입력해주세요.' }).ref(el)
              }}
              placeholder="여행 이야기를 자유롭게 써주세요."
              rows={18}
              className={`w-full px-4 py-3 border rounded-xl text-[15px] leading-[1.85]
                          text-text-main resize-none outline-none transition-colors
                          placeholder:text-gray-300 font-sans
                          ${errors.content ? 'border-red-400' : 'border-gray-200 focus:border-primary'}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(submit)()
              }}
              {...register('content', { required: '내용을 입력해주세요.' })}
            />
            {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>}
          </div>

          {/* 서버 에러 */}
          {serverError && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-500">{serverError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-white text-sm font-bold h-12 rounded-xl
                       hover:bg-orange-500 transition-colors disabled:opacity-50 mt-2"
          >
            {isPending ? '저장 중...' : '저장하기 ✈️'}
          </button>

        </div>
      </form>
    </div>
  )
}
