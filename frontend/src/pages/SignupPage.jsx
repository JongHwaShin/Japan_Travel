import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Button from '../components/Button'

export default function SignupPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onBlur' })

  const password = watch('password')

  const onSubmit = async ({ email, password, nickname }) => {
    setServerError('')
    setIsLoading(true)
    try {
      await api.post('/api/auth/signup', { email, password, nickname })
      navigate('/login', { state: { signupSuccess: true } })
    } catch (err) {
      setServerError(err.response?.data?.message ?? '회원가입에 실패했습니다.')
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
          <p className="mt-2 text-sm text-text-sub">함께 일본을 탐험해봐요!</p>
        </div>

        {/* 카드 */}
        <div className="bg-card rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h1 className="text-xl font-bold text-text-main mb-6">회원가입</h1>

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
                className={inputClass(errors.email)}
                {...register('email', {
                  required: '이메일을 입력해주세요.',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: '올바른 이메일 형식을 입력해주세요.',
                  },
                })}
              />
              <FieldError error={errors.email} />
            </div>

            {/* 닉네임 */}
            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">
                닉네임
              </label>
              <input
                type="text"
                autoComplete="nickname"
                placeholder="사용할 닉네임을 입력해주세요"
                className={inputClass(errors.nickname)}
                {...register('nickname', {
                  required: '닉네임을 입력해주세요.',
                  minLength: { value: 2, message: '닉네임은 2자 이상이어야 합니다.' },
                  maxLength: { value: 20, message: '닉네임은 20자 이하여야 합니다.' },
                })}
              />
              <FieldError error={errors.nickname} />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">
                비밀번호
              </label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="8자 이상 입력해주세요"
                className={inputClass(errors.password)}
                {...register('password', {
                  required: '비밀번호를 입력해주세요.',
                  minLength: { value: 8, message: '비밀번호는 8자 이상이어야 합니다.' },
                })}
              />
              <FieldError error={errors.password} />
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">
                비밀번호 확인
              </label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="비밀번호를 다시 입력해주세요"
                className={inputClass(errors.confirmPassword)}
                {...register('confirmPassword', {
                  required: '비밀번호 확인을 입력해주세요.',
                  validate: (value) =>
                    value === password || '비밀번호가 일치하지 않습니다.',
                })}
              />
              <FieldError error={errors.confirmPassword} />
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
                  가입 중...
                </span>
              ) : (
                '회원가입'
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-text-sub">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              로그인
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}

// 인풋 클래스 헬퍼
function inputClass(error) {
  return `w-full h-11 px-4 rounded-xl border text-sm outline-none transition-colors ${
    error
      ? 'border-red-400 focus:border-red-400 bg-red-50'
      : 'border-gray-200 focus:border-primary bg-white'
  }`
}

// 필드 에러 컴포넌트
function FieldError({ error }) {
  if (!error) return null
  return <p className="mt-1 text-xs text-red-500">{error.message}</p>
}
