import React, { useState, useRef, useEffect } from 'react'
import { ShieldCheck, Eye, EyeOff, KeyRound, Loader2, Zap } from 'lucide-react'
import { useTranslation } from '../i18n/LanguageContext'
import { AppData } from '../types'

interface LockScreenProps {
  onUnlock: (data: AppData) => void
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const { language, setLanguage, t } = useTranslation()
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
    <div className="h-screen w-screen bg-[#0b0f19] text-slate-100 flex flex-col select-none overflow-hidden relative">
      {/* Top Header Bar for Drag & Controls */}
      <div className="h-11 border-b border-slate-800/80 flex items-center justify-between px-3.5 z-40 bg-slate-900/40 backdrop-blur">
        <div className="drag-region flex-1 h-full flex items-center pl-16">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
              <Zap className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
            </div>
            <span className="font-semibold text-xs tracking-wide text-slate-200">QuickDesk</span>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="no-drag flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[11px] font-semibold">
          <button
            onClick={() => setLanguage('tr')}
            title="Türkçe"
            className={`px-1.5 py-0.5 rounded transition ${
              language === 'tr'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TR
          </button>
          <button
            onClick={() => setLanguage('en')}
            title="English"
            className={`px-1.5 py-0.5 rounded transition ${
              language === 'en'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Main Lock Screen Card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className={`w-full max-w-sm bg-slate-900/90 border border-slate-800/90 rounded-2xl p-7 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center transition-all ${
            isShaking ? 'animate-shake' : ''
          }`}
        >
          {/* Glowing Shield Icon */}
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-xl"></div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-slate-800 border border-indigo-500/30 flex items-center justify-center relative shadow-inner">
              <ShieldCheck className="w-7 h-7 text-indigo-400" />
            </div>
          </div>

          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-1.5">
            <span>{t('security.lockScreenTitle')}</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              AES-256
            </span>
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            {t('security.lockScreenSubtitle')}
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <div className="relative w-full">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
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
                className={`w-full bg-slate-950 border rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition ${
                  error
                    ? 'border-rose-500/80 focus:border-rose-500'
                    : 'border-slate-800 focus:border-indigo-500'
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="text-[11.5px] text-rose-400 font-medium text-left px-1">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full mt-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-medium text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
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
