import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import Button from '../components/Button'

const SAVED_EMAIL_KEY = 'savedEmail'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ mode: 'onBlur' })

  // 이미 로그인 상태면 홈으로
  useEffect(() => {
    if (isLoggedIn) navigate('/', { replace: true })
  }, [isLoggedIn, navigate])

  // 저장된 이메일 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(SAVED_EMAIL_KEY)
    if (saved) {
      setValue('email', saved)
      setValue('rememberEmail', true)
    }
  }, [setValue])

  const onSubmit = async ({ email, password, rememberEmail, autoLogin }) => {
    setServerError('')
    setIsLoading(true)
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      const { accessToken, refreshToken, user } = data.data

      if (rememberEmail) {
        localStorage.setItem(SAVED_EMAIL_KEY, email)
      } else {
        localStorage.removeItem(SAVED_EMAIL_KEY)
      }

      login(user, accessToken, refreshToken, autoLogin)
      window.scrollTo(0, 0)
      navigate('/', { replace: true })
    } catch (err) {
      setServerError(err.response?.data?.message ?? '로그인에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">

        {/* 로고 */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <span className="text-5xl">🗾</span>
            <span className="text-2xl font-bold text-text-main">일본여행</span>
          </Link>
          <p className="mt-2 text-sm text-text-sub">다시 만나서 반가워요!</p>
        </div>

        {/* 카드 */}
        <div className="bg-card rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h1 className="text-xl font-bold text-text-main mb-6">로그인</h1>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">
                이메일
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="example@email.com"
                className={`w-full h-11 px-4 rounded-xl border text-sm outline-none transition-colors
                  ${errors.email
                    ? 'border-red-400 focus:border-red-400 bg-red-50'
                    : 'border-gray-200 focus:border-primary bg-white'
                  }`}
                {...register('email', {
                  required: '이메일을 입력해주세요.',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: '올바른 이메일 형식을 입력해주세요.',
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">
                비밀번호
              </label>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="비밀번호를 입력해주세요"
                className={`w-full h-11 px-4 rounded-xl border text-sm outline-none transition-colors
                  ${errors.password
                    ? 'border-red-400 focus:border-red-400 bg-red-50'
                    : 'border-gray-200 focus:border-primary bg-white'
                  }`}
                {...register('password', {
                  required: '비밀번호를 입력해주세요.',
                })}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* 이메일 저장 + 자동로그인 */}
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <input
                  id="rememberEmail"
                  type="checkbox"
                  className="w-4 h-4 accent-primary cursor-pointer"
                  {...register('rememberEmail')}
                />
                <label htmlFor="rememberEmail" className="text-sm text-text-sub cursor-pointer select-none">
                  이메일 저장
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="autoLogin"
                  type="checkbox"
                  className="w-4 h-4 accent-primary cursor-pointer"
                  {...register('autoLogin')}
                />
                <label htmlFor="autoLogin" className="text-sm text-text-sub cursor-pointer select-none">
                  자동로그인
                </label>
              </div>
            </div>

            {/* 서버 에러 */}
            {serverError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                <span className="text-red-500 text-xs leading-snug">{serverError}</span>
              </div>
            )}

            <Button type="submit" fullWidth disabled={isLoading} size="md">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  로그인 중...
                </span>
              ) : (
                '로그인'
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-text-sub">
            아직 계정이 없으신가요?{' '}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              회원가입
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
