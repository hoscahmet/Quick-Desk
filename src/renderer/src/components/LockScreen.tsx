import React, { useState, useRef, useEffect } from 'react'
import { ShieldCheck, Eye, EyeOff, KeyRound, Loader2, Sun, Moon, Monitor } from 'lucide-react'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'
import { Logo } from './Logo'
import { AppData } from '../types'

interface LockScreenProps {
  onUnlock: (data: AppData) => void
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const { language, setLanguage, t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isShaking, setIsShaking] = useState(false)

  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim() || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await window.api.security.unlock(password)
      if (result.success && result.data) {
        onUnlock(result.data as AppData)
      } else {
        setError(t('security.invalidPassword'))
        setIsShaking(true)
        setTimeout(() => setIsShaking(false), 500)
        setPassword('')
        inputRef.current?.focus()
      }
    } catch {
      setError(t('security.invalidPassword'))
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen w-screen bg-app text-app flex flex-col select-none overflow-hidden relative">
      {/* Top Header Bar for Drag & Controls */}
      <div className="h-11 border-b border-main flex items-center justify-between px-3.5 z-40 bg-header/60 backdrop-blur">
        <div className="drag-region flex-1 h-full flex items-center pl-16">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span className="font-semibold text-xs tracking-wide text-app">QuickDesk</span>
          </div>
        </div>

        {/* Controls: Theme & Language */}
        <div className="no-drag flex items-center gap-2">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            title={t(`theme.${theme}`)}
            className="p-1.5 rounded-lg text-muted hover:text-app hover:bg-surface border border-main transition"
          >
            {theme === 'system' && <Monitor className="w-3.5 h-3.5" />}
            {theme === 'dark' && <Moon className="w-3.5 h-3.5" />}
            {theme === 'light' && <Sun className="w-3.5 h-3.5" />}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-surface border border-main rounded-lg p-0.5 text-[11px] font-semibold">
            <button
              onClick={() => setLanguage('tr')}
              title="Türkçe"
              className={`px-1.5 py-0.5 rounded transition ${
                language === 'tr'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-muted hover:text-app'
              }`}
            >
              TR
            </button>
            <button
              onClick={() => setLanguage('en')}
              title="English"
              className={`px-1.5 py-0.5 rounded transition ${
                language === 'en'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-muted hover:text-app'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Main Lock Screen Card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className={`w-full max-w-sm bg-card border border-main rounded-2xl p-7 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center transition-all ${
            isShaking ? 'animate-shake' : ''
          }`}
        >
          {/* Glowing Shield Icon */}
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-2xl bg-accent-subtle blur-xl"></div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-surface border border-accent/30 flex items-center justify-center relative shadow-inner">
              <ShieldCheck className="w-7 h-7 text-accent" />
            </div>
          </div>

          <h2 className="text-base font-bold text-app flex items-center gap-2 mb-1.5">
            <span>{t('security.lockScreenTitle')}</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              AES-256
            </span>
          </h2>

          <p className="text-xs text-muted leading-relaxed mb-6">
            {t('security.lockScreenSubtitle')}
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <div className="relative w-full">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                <KeyRound className="w-4 h-4" />
              </div>

              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError(null)
                }}
                placeholder={t('security.passwordPlaceholder')}
                disabled={isLoading}
                className={`w-full bg-input border rounded-xl pl-10 pr-10 py-2.5 text-xs text-app placeholder:text-muted outline-none transition ${
                  error
                    ? 'border-rose-500/80 focus:border-rose-500'
                    : 'border-main focus:border-accent'
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-app transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="text-[11.5px] text-rose-500 dark:text-rose-400 font-medium text-left px-1">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full mt-1 py-2.5 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:hover:bg-accent text-white font-medium text-xs transition flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('security.unlocking')}</span>
                </>
              ) : (
                <span>{t('security.unlock')}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
