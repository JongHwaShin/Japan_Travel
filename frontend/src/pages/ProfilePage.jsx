import { useState, useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import {
  updateNickname,
  updatePassword,
  updateProfileImage,
  deleteAccount,
} from '../api/users'

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3
        rounded-xl shadow-lg text-white text-sm font-medium whitespace-nowrap
        ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
    >
      {message}
    </div>
  )
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

// ─── ProfilePage ───────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const logout = useAuthStore((s) => s.logout)

  // ── 토스트
  const [toast, setToast] = useState(null)
  const showToast = (message, type = 'success') => setToast({ message, type })

  // ── 프로필 데이터 (useEffect + 직접 API 호출)
  const [profileData, setProfileData] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState(null)

  // ── 닉네임 별도 state
  const [nickname, setNickname] = useState('')
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [nicknameInput, setNicknameInput] = useState('')

  // ── 프로필 이미지 파일 업로드
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [imageModalOpen, setImageModalOpen] = useState(false)

  // ── 회원 탈퇴 모달
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')

  // ── GET /api/users/me 호출 함수
  const fetchProfile = async () => {
    try {
      setProfileLoading(true)
      setProfileError(null)

      const res = await api.get('/api/users/me')
      console.log('[ProfilePage] GET /api/users/me 응답 전체:', res.data)

      const data = res.data.data
      console.log('[ProfilePage] profile data:', data)
      console.log('[ProfilePage] profile.nickname:', data?.nickname)

      setProfileData(data)
      setNickname(data?.nickname ?? '')
    } catch (err) {
      console.error('[ProfilePage] 프로필 조회 실패:', err)
      setProfileError('프로필을 불러오는데 실패했습니다.')
    } finally {
      setProfileLoading(false)
    }
  }

  // 컴포넌트 마운트 시 API 호출
  useEffect(() => {
    fetchProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const nicknameMutation = useMutation({
    mutationFn: updateNickname,
    onSuccess: () => {
      setIsEditingNickname(false)
      showToast('닉네임이 변경되었습니다.')
      fetchProfile() // 갱신
    },
    onError: (err) =>
      showToast(err.response?.data?.message || '닉네임 변경에 실패했습니다.', 'error'),
  })

  const imageMutation = useMutation({
    mutationFn: updateProfileImage,
    onSuccess: () => {
      setImageModalOpen(false)
      setSelectedFile(null)
      setPreviewUrl(null)
      showToast('프로필 이미지가 변경되었습니다.')
      fetchProfile() // 갱신
    },
    onError: (err) =>
      showToast(err.response?.data?.message || '이미지 변경에 실패했습니다.', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      logout()
    },
    onError: (err) => {
      showToast(err.response?.data?.message || '회원 탈퇴에 실패했습니다.', 'error')
      setDeleteModalOpen(false)
      setDeletePassword('')
    },
  })

  // ── 비밀번호 폼
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetPasswordForm,
    watch,
    setError: setPasswordError,
  } = useForm()

  const newPasswordValue = watch('newPassword')

  const passwordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      updatePassword(currentPassword, newPassword),
    onSuccess: () => {
      resetPasswordForm()
      showToast('비밀번호가 변경되었습니다.')
    },
    onError: (err) => {
      const message = err.response?.data?.message || '비밀번호 변경에 실패했습니다.'
      setPasswordError('currentPassword', { message })
    },
  })

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleNicknameSave = () => {
    const trimmed = nicknameInput.trim()
    if (trimmed.length < 2) {
      showToast('닉네임은 2자 이상이어야 합니다.', 'error')
      return
    }
    nicknameMutation.mutate(trimmed)
  }

  const startEditNickname = () => {
    setNicknameInput(nickname)
    setIsEditingNickname(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 선택할 수 있습니다.', 'error')
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result)
      setSelectedFile(file)
      setImageModalOpen(true)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      showToast('비밀번호를 입력해주세요.', 'error')
      return
    }
    deleteMutation.mutate(deletePassword)
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="page-container flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (profileError) {
    return (
      <div className="page-container flex flex-col items-center py-20 gap-3">
        <p className="text-sm text-red-500">{profileError}</p>
        <button
          onClick={fetchProfile}
          className="text-sm text-primary hover:underline"
        >
          다시 시도
        </button>
      </div>
    )
  }

  const createdAtLabel = profileData?.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  return (
    <div className="page-container max-w-lg mx-auto py-6 space-y-4">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* 숨김 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── 1. 프로필 헤더 ──────────────────────────────────────────────────── */}
      <div className="bg-card rounded-2xl p-6 shadow-sm flex flex-col items-center gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="relative group focus:outline-none"
          aria-label="프로필 이미지 변경"
        >
          {profileData?.profileImage ? (
            <img
              src={profileData.profileImage}
              alt="프로필"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold shadow-md select-none">
              {nickname?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </button>

        <div className="text-center space-y-0.5">
          <p className="text-lg font-bold text-text-main">{nickname || '닉네임 없음'}</p>
          <p className="text-sm text-text-sub">{profileData?.email}</p>
          {createdAtLabel && (
            <p className="text-xs text-text-sub">가입일 {createdAtLabel}</p>
          )}
        </div>
      </div>

      {/* ── 2. 닉네임 수정 ──────────────────────────────────────────────────── */}
      <div className="bg-card rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-text-main mb-3">닉네임 수정</h2>

        {isEditingNickname ? (
          /* 수정 모드: 입력창 + 저장/취소 */
          <div className="space-y-2">
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNicknameSave()}
              maxLength={20}
              autoFocus
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <div className="flex gap-2">
              <button
                onClick={handleNicknameSave}
                disabled={nicknameMutation.isPending}
                className="flex-1 h-10 bg-primary text-white rounded-xl text-sm font-medium
                  hover:bg-orange-500 disabled:opacity-50 transition-colors"
              >
                {nicknameMutation.isPending ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={() => setIsEditingNickname(false)}
                className="flex-1 h-10 border border-gray-200 text-text-sub rounded-xl
                  text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          /* 기본 모드: 닉네임 텍스트 + 수정 버튼 */
          <div className="flex items-center justify-between py-0.5">
            <span className="text-sm text-text-main font-medium">
              {nickname || <span className="text-text-sub">닉네임 없음</span>}
            </span>
            <button
              onClick={startEditNickname}
              className="text-sm text-primary font-medium hover:underline"
            >
              수정
            </button>
          </div>
        )}
      </div>

      {/* ── 3. 비밀번호 변경 ────────────────────────────────────────────────── */}
      <div className="bg-card rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-text-main mb-3">비밀번호 변경</h2>

        <form
          onSubmit={handleSubmit(({ currentPassword, newPassword }) =>
            passwordMutation.mutate({ currentPassword, newPassword })
          )}
          className="space-y-2"
        >
          <div>
            <input
              type="password"
              placeholder="현재 비밀번호"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm
                focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                ${errors.currentPassword ? 'border-red-400' : 'border-gray-200'}`}
              {...register('currentPassword', { required: '현재 비밀번호를 입력해주세요.' })}
            />
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="새 비밀번호 (영문+숫자 8자 이상)"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm
                focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                ${errors.newPassword ? 'border-red-400' : 'border-gray-200'}`}
              {...register('newPassword', {
                required: '새 비밀번호를 입력해주세요.',
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
                  message: '영문자와 숫자를 포함하여 8자 이상 입력해주세요.',
                },
              })}
            />
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="새 비밀번호 확인"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm
                focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200'}`}
              {...register('confirmPassword', {
                required: '비밀번호 확인을 입력해주세요.',
                validate: (v) => v === newPasswordValue || '새 비밀번호가 일치하지 않습니다.',
              })}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="w-full h-11 bg-primary text-white rounded-xl text-sm font-medium
              hover:bg-orange-500 disabled:opacity-50 transition-colors mt-1"
          >
            {passwordMutation.isPending ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      </div>

      {/* ── 4. 회원 탈퇴 ────────────────────────────────────────────────────── */}
      <div className="bg-card rounded-2xl p-5 shadow-sm border border-red-100">
        <h2 className="text-sm font-semibold text-red-500 mb-1">회원 탈퇴</h2>
        <p className="text-xs text-text-sub mb-3">
          탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
        </p>
        <button
          onClick={() => setDeleteModalOpen(true)}
          className="w-full h-10 border border-red-300 text-red-500 rounded-xl text-sm
            font-medium hover:bg-red-50 transition-colors"
        >
          회원 탈퇴
        </button>
      </div>

      {/* ── 프로필 이미지 미리보기 모달 ─────────────────────────────────────── */}
      {imageModalOpen && (
        <Modal onClose={() => { setImageModalOpen(false); setSelectedFile(null); setPreviewUrl(null) }}>
          <h3 className="text-base font-semibold text-text-main mb-4">프로필 이미지 변경</h3>
          {previewUrl && (
            <div className="flex justify-center mb-4">
              <img
                src={previewUrl}
                alt="미리보기"
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
              />
            </div>
          )}
          <p className="text-xs text-text-sub text-center mb-4">{selectedFile?.name}</p>
          <div className="flex gap-2">
            <button
              onClick={() => imageMutation.mutate(selectedFile)}
              disabled={imageMutation.isPending}
              className="flex-1 h-10 bg-primary text-white rounded-xl text-sm font-medium
                hover:bg-orange-500 disabled:opacity-50 transition-colors"
            >
              {imageMutation.isPending ? '업로드 중...' : '저장'}
            </button>
            <button
              onClick={() => { setImageModalOpen(false); setSelectedFile(null); setPreviewUrl(null) }}
              className="flex-1 h-10 border border-gray-200 text-text-sub rounded-xl
                text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          </div>
        </Modal>
      )}

      {/* ── 회원 탈퇴 확인 모달 ─────────────────────────────────────────────── */}
      {deleteModalOpen && (
        <Modal onClose={() => { setDeleteModalOpen(false); setDeletePassword('') }}>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-text-main">정말 탈퇴하시겠습니까?</h3>
            <p className="text-xs text-text-sub mt-1">
              작성한 모든 일기, 댓글, 좋아요 데이터가 영구 삭제됩니다.
            </p>
          </div>
          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleDeleteAccount()}
            placeholder="비밀번호 확인"
            autoFocus
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm mb-4
              focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-300"
          />
          <div className="flex gap-2">
            <button
              onClick={handleDeleteAccount}
              disabled={deleteMutation.isPending}
              className="flex-1 h-10 bg-red-500 text-white rounded-xl text-sm font-medium
                hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {deleteMutation.isPending ? '처리 중...' : '탈퇴 확인'}
            </button>
            <button
              onClick={() => { setDeleteModalOpen(false); setDeletePassword('') }}
              className="flex-1 h-10 border border-gray-200 text-text-sub rounded-xl
                text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
