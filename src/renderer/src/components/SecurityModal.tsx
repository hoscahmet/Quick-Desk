import React, { useState } from 'react'
import { ShieldCheck, Lock, Unlock, KeyRound, X, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { useTranslation } from '../i18n/LanguageContext'

interface SecurityModalProps {
  isOpen: boolean
  onClose: () => void
  hasPassword: boolean
  autoLockMinutes: number
  onPasswordSet: () => void
  onPasswordChanged: () => void
  onPasswordRemoved: () => void
  onLockNow: () => void
  onAutoLockChange: (mins: number) => void
  onToast: (msg: string) => void
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  hasPassword,
  autoLockMinutes,
  onPasswordSet,
  onPasswordChanged,
  onPasswordRemoved,
  onLockNow,
  onAutoLockChange,
  onToast
}) => {
  const { t } = useTranslation()

  type SubView = 'overview' | 'set' | 'change' | 'remove'
  const [subview, setSubview] = useState<SubView>(hasPassword ? 'overview' : 'set')

  // Form states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  // Calculate password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-700' }
    let score = 0
    if (pwd.length >= 6) score++
    if (pwd.length >= 10) score++
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
    if (/\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++

    if (score <= 1) {
      return { score: 1, label: t('security.strengthWeak'), color: 'bg-rose-500' }
    } else if (score <= 3) {
      return { score: 2, label: t('security.strengthMedium'), color: 'bg-amber-500' }
    } else {
      return { score: 3, label: t('security.strengthStrong'), color: 'bg-emerald-500' }
    }
  }

  const strength = getPasswordStrength(newPassword)

  const resetForm = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError(null)
    setShowPassword(false)
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 4) {
      setError(t('security.passwordTooShort'))
      return
    }

    if (newPassword !== confirmPassword) {
      setError(t('security.passwordsDoNotMatch'))
      return
    }

    setIsSubmitting(true)
    try {
      const res = await window.api.security.setPassword(newPassword)
      if (res.success) {
        onPasswordSet()
        onToast(t('security.passwordSetSuccess'))
        resetForm()
        onClose()
      } else {
        setError(res.error || t('common.error'))
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!currentPassword) {
      setError(t('security.invalidCurrentPassword'))
      return
    }

    if (newPassword.length < 4) {
      setError(t('security.passwordTooShort'))
      return
    }

    if (newPassword !== confirmPassword) {
      setError(t('security.passwordsDoNotMatch'))
      return
    }

    setIsSubmitting(true)
    try {
      const res = await window.api.security.changePassword(currentPassword, newPassword)
      if (res.success) {
        onPasswordChanged()
        onToast(t('security.passwordChangedSuccess'))
        resetForm()
        setSubview('overview')
      } else {
        setError(
          res.error === 'INVALID_OLD_PASSWORD'
            ? t('security.invalidCurrentPassword')
            : res.error || t('common.error')
        )
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemovePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!currentPassword) {
      setError(t('security.invalidCurrentPassword'))
      return
    }

    setIsSubmitting(true)
    try {
      const res = await window.api.security.removePassword(currentPassword)
      if (res.success) {
        onPasswordRemoved()
        onToast(t('security.passwordRemovedSuccess'))
        resetForm()
        onClose()
      } else {
        setError(
          res.error === 'INVALID_PASSWORD'
            ? t('security.invalidCurrentPassword')
            : res.error || t('common.error')
        )
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div className="bg-card border border-main rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-main">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent-subtle text-accent flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-app">
              {hasPassword ? t('security.modalTitleManage') : t('security.modalTitleSet')}
            </h3>
          </div>
          <button
            onClick={() => {
              resetForm()
              onClose()
            }}
            className="text-muted hover:text-app transition p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View 1: Set New Password (When not yet password protected) */}
        {!hasPassword && (
          <form onSubmit={handleSetPassword} className="flex flex-col gap-3.5">
            <div className="text-xs text-muted leading-relaxed bg-surface/60 border border-main rounded-xl p-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>{t('security.modalDescSet')}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-muted">
                {t('security.newPasswordLabel')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('security.newPasswordPlaceholder')}
                  className="w-full bg-input border border-main rounded-xl px-3 py-2 text-xs text-app outline-none focus:border-accent pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-app"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Strength Meter */}
              {newPassword && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color} ${
                        strength.score >= 1 ? 'w-1/3' : 'w-0'
                      }`}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color} ${
                        strength.score >= 2 ? 'w-1/3' : 'w-0'
                      }`}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color} ${
                        strength.score >= 3 ? 'w-1/3' : 'w-0'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-muted font-medium">
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-muted">
                {t('security.confirmPasswordLabel')}
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('security.confirmPasswordPlaceholder')}
                className="bg-input border border-main rounded-xl px-3 py-2 text-xs text-app outline-none focus:border-accent"
              />
            </div>

            {error && (
              <div className="text-xs text-rose-500 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-main">
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  onClose()
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-app"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !newPassword || !confirmPassword}
                className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium text-xs transition shadow-sm"
              >
                {t('common.save')}
              </button>
            </div>
          </form>
        )}

        {/* View 2: Overview (When already password protected) */}
        {hasPassword && subview === 'overview' && (
          <div className="flex flex-col gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-emerald-600 dark:text-emerald-300">
                  AES-256-GCM Koruması Aktif
                </div>
                <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                  {t('security.modalDescProtected')}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  onClose()
                  onLockNow()
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface/70 border border-main hover:border-amber-500/40 hover:bg-surface transition text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <div>
                    <div className="text-xs font-medium text-app group-hover:text-amber-500 dark:group-hover:text-amber-300">
                      {t('security.lockNow')}
                    </div>
                    <div className="text-[10px] text-muted">
                      Uygulamayı derhal kilit ekranına al
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  resetForm()
                  setSubview('change')
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface/70 border border-main hover:border-accent/40 hover:bg-surface transition text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-accent" />
                  <div>
                    <div className="text-xs font-medium text-app group-hover:text-accent">
                      {t('security.changePasswordBtn')}
                    </div>
                    <div className="text-[10px] text-muted">
                      Mevcut şifrenizi yenisiyle değiştirin
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  resetForm()
                  setSubview('remove')
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface/70 border border-main hover:border-rose-500/40 hover:bg-surface transition text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <Unlock className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                  <div>
                    <div className="text-xs font-medium text-app group-hover:text-rose-500 dark:group-hover:text-rose-300">
                      {t('security.removePasswordBtn')}
                    </div>
                    <div className="text-[10px] text-muted">
                      Şifreyi kaldır ve verileri düz metin sakla
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Auto-Lock Settings */}
            <div className="pt-2 border-t border-main flex items-center justify-between">
              <div>
                <label className="text-xs font-medium text-app">
                  {t('security.autoLockLabel')}
                </label>
                <div className="text-[10px] text-muted">
                  Fare veya klavye hareketi olmadığında
                </div>
              </div>
              <select
                value={autoLockMinutes}
                onChange={(e) => onAutoLockChange(parseInt(e.target.value, 10))}
                className="bg-surface border border-main rounded-lg px-2.5 py-1.5 text-xs text-secondary outline-none focus:border-accent"
              >
                <option value="0">{t('security.autoLockNever')}</option>
                <option value="2">{t('security.autoLock2Min')}</option>
                <option value="5">{t('security.autoLock5Min')}</option>
                <option value="15">{t('security.autoLock15Min')}</option>
                <option value="30">{t('security.autoLock30Min')}</option>
              </select>
            </div>
          </div>
        )}

        {/* View 3: Change Password */}
        {hasPassword && subview === 'change' && (
          <form onSubmit={handleChangePassword} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-muted">
                {t('security.currentPasswordLabel')}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t('security.currentPasswordPlaceholder')}
                className="bg-input border border-main rounded-xl px-3 py-2 text-xs text-app outline-none focus:border-accent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-muted">
                {t('security.newPasswordLabel')}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('security.newPasswordPlaceholder')}
                className="bg-input border border-main rounded-xl px-3 py-2 text-xs text-app outline-none focus:border-accent"
              />
              {/* Strength Meter */}
              {newPassword && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color} ${
                        strength.score >= 1 ? 'w-1/3' : 'w-0'
                      }`}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color} ${
                        strength.score >= 2 ? 'w-1/3' : 'w-0'
                      }`}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color} ${
                        strength.score >= 3 ? 'w-1/3' : 'w-0'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-muted font-medium">
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-muted">
                {t('security.confirmPasswordLabel')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('security.confirmPasswordPlaceholder')}
                className="bg-input border border-main rounded-xl px-3 py-2 text-xs text-app outline-none focus:border-accent"
              />
            </div>

            {error && (
              <div className="text-xs text-rose-500 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-main">
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  setSubview('overview')
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-app"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
                className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium text-xs transition shadow-sm"
              >
                {t('security.changePasswordBtn')}
              </button>
            </div>
          </form>
        )}

        {/* View 4: Remove Password */}
        {hasPassword && subview === 'remove' && (
          <form onSubmit={handleRemovePassword} className="flex flex-col gap-3.5">
            <div className="text-xs text-rose-600 dark:text-rose-300 leading-relaxed bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-rose-700 dark:text-rose-200">
                  {t('security.confirmRemoveTitle')}
                </div>
                <div className="text-[11px] text-rose-600/80 dark:text-rose-300/80 mt-0.5">
                  {t('security.confirmRemoveDesc')}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-muted">
                {t('security.currentPasswordLabel')}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t('security.currentPasswordPlaceholder')}
                className="bg-input border border-main rounded-xl px-3 py-2 text-xs text-app outline-none focus:border-rose-500"
              />
            </div>

            {error && (
              <div className="text-xs text-rose-500 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-main">
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  setSubview('overview')
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-app"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !currentPassword}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium text-xs transition shadow-sm"
              >
                {t('security.removePasswordBtn')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
