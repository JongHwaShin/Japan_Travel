import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'

const DRAFT_KEY = 'log_draft'

// ─── 마크다운 툴바 버튼 ─────────────────────────────────────────────────────

const TOOLBAR = [
  { label: 'B', syntax: '**', title: '굵게' },
  { label: 'I', syntax: '_', title: '기울임' },
  { label: '# ', label2: 'H1', syntax: '# ', title: '제목', prefix: true },
  { label: '> ', label2: 'Q', syntax: '> ', title: '인용', prefix: true },
]

function ToolbarButton({ label, title, onClick }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="px-2.5 py-1 text-xs font-bold text-text-sub bg-gray-50 hover:bg-gray-100
                 border border-gray-200 rounded-md transition-colors"
    >
      {label}
    </button>
  )
}

// ─── 임시저장 알림 ──────────────────────────────────────────────────────────

function DraftBadge({ show }) {
  if (!show) return null
  return (
    <span className="text-xs text-text-sub animate-pulse">임시저장됨</span>
  )
}

// ─── 메인 페이지 ────────────────────────────────────────────────────────────

export default function LogWritePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const textareaRef = useRef(null)
  const draftSavedRef = useRef(false)

  // 지역 목록
  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => api.get('/regions').then((r) => r.data.data),
    staleTime: 1000 * 60 * 30,
  })

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      title: '',
      content: '',
      regionId: '',
      travelDate: '',
      isPublic: true,
    },
  })

  // 마운트 시 임시저장 불러오기
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY)
      if (draft) {
        const parsed = JSON.parse(draft)
        Object.entries(parsed).forEach(([k, v]) => setValue(k, v))
      }
    } catch {}
  }, [setValue])

  // 폼 값 변경 시 자동 임시저장 (1초 디바운스)
  useEffect(() => {
    const subscription = watch((values) => {
      const timer = setTimeout(() => {
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(values))
          draftSavedRef.current = true
        } catch {}
      }, 1000)
      return () => clearTimeout(timer)
    })
    return () => subscription.unsubscribe()
  }, [watch])

  const { mutate: submit, isPending, isError, error } = useMutation({
    mutationFn: (data) =>
      api.post('/logs', {
        title: data.title,
        content: data.content,
        regionId: data.regionId ? Number(data.regionId) : null,
        travelDate: data.travelDate || null,
        isPublic: data.isPublic,
      }),
    onSuccess: (res) => {
      localStorage.removeItem(DRAFT_KEY)
      queryClient.invalidateQueries({ queryKey: ['logs'] })
      const logId = res.data.data?.logId
      navigate(logId ? `/logs/${logId}` : '/logs', { replace: true })
    },
  })

  // 마크다운 툴바: wrap selection or insert at cursor
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
      next =
        current.slice(0, start) +
        syntax + selected + syntax +
        current.slice(end)
    }
    setValue('content', next, { shouldDirty: true })
    // 커서 위치 복원
    setTimeout(() => {
      ta.selectionStart = isPrefix ? start + syntax.length : start + syntax.length
      ta.selectionEnd   = isPrefix ? end + syntax.length : end + selected.length + syntax.length
      ta.focus()
    }, 0)
  }

  const serverError = error?.response?.data?.message ?? (isError ? '작성에 실패했습니다.' : null)
  const isDraftSaved = isDirty && draftSavedRef.current

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
          <div className="flex items-center gap-3">
            <DraftBadge show={isDraftSaved} />
            <button
              type="submit"
              disabled={isPending}
              className="bg-primary text-white text-sm font-semibold px-5 h-9 rounded-xl
                         hover:bg-orange-500 transition-colors disabled:opacity-50"
            >
              {isPending ? '발행 중...' : '발행하기'}
            </button>
          </div>
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

          {/* 메타 정보 행 */}
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
              <ToolbarButton label="B" title="굵게 (Ctrl+B)" onClick={() => insertMarkdown('**')} />
              <ToolbarButton label="I" title="기울임" onClick={() => insertMarkdown('_')} />
              <ToolbarButton label="H1" title="제목" onClick={() => insertMarkdown('# ', true)} />
              <ToolbarButton label="❝" title="인용" onClick={() => insertMarkdown('> ', true)} />
              <ToolbarButton label="—" title="구분선" onClick={() => {
                const cur = getValues('content')
                setValue('content', cur + '\n\n---\n\n', { shouldDirty: true })
              }} />
              <span className="ml-auto text-xs text-text-sub">Ctrl+Enter로 발행</span>
            </div>

            {/* 본문 에디터 */}
            <textarea
              ref={(el) => {
                textareaRef.current = el
                register('content', { required: '내용을 입력해주세요.' }).ref(el)
              }}
              placeholder={`여행 이야기를 자유롭게 써주세요.\n\n마크다운을 지원합니다.\n**굵게**, _기울임_, # 제목`}
              rows={18}
              className={`w-full px-4 py-3 border rounded-xl text-[15px] leading-[1.85]
                          text-text-main resize-none outline-none transition-colors
                          placeholder:text-gray-300 font-sans
                          ${errors.content ? 'border-red-400' : 'border-gray-200 focus:border-primary'}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit(submit)()
                }
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

          {/* 하단 발행 버튼 (모바일 편의) */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-white text-sm font-bold h-12 rounded-xl
                       hover:bg-orange-500 transition-colors disabled:opacity-50 mt-2"
          >
            {isPending ? '발행 중...' : '발행하기 ✈️'}
          </button>

        </div>
      </form>
    </div>
  )
}
