import api from './axios'

export const getMyProfile = () =>
  api.get('/api/users/me').then((r) => r.data.data)

export const getMyLogs = () =>
  api.get('/api/logs/my').then((r) => r.data.data)

export const updateNickname = (nickname) =>
  api.put('/api/users/me/nickname', { nickname }).then((r) => r.data)

export const updatePassword = (currentPassword, newPassword) =>
  api.put('/api/users/me/password', { currentPassword, newPassword }).then((r) => r.data)

export const updateProfileImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api
    .put('/api/users/me/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data)
}

export const deleteAccount = (password) =>
  api.delete('/api/users/me', { data: { password } }).then((r) => r.data)
