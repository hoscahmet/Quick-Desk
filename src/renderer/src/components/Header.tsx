import React from 'react'
import { Zap, Pin, Minimize2, Maximize2, Shield, ShieldCheck, Lock } from 'lucide-react'
import { useTranslation } from '../i18n/LanguageContext'

interface HeaderProps {
  isPinned: boolean
  isCompact: boolean
  isSaving: boolean
  hasPassword: boolean
  onTogglePin: () => void
  onToggleCompact: () => void
  onOpenSecurity: () => void
  onQuickLock: () => void
}

export const Header: React.FC<HeaderProps> = ({
  isPinned,
  isCompact,
  isSaving,
  hasPassword,
  onTogglePin,
  onToggleCompact,
  onOpenSecurity,
  onQuickLock
}) => {
  const { language, setLanguage, t } = useTranslation()

  return (
    <header className="h-11 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between px-3.5 z-40 select-none">
      <div className="drag-region flex-1 h-full flex items-center pl-16">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
            <Zap className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
          </div>
          <span className="font-semibold text-xs tracking-wide text-slate-100">
            {t('header.appName')}
          </span>
          <span className="text-[10px] text-slate-500 transition-opacity duration-300 ml-2">
            {isSaving ? t('header.saving') : t('header.saved')}
          </span>
        </div>
      </div>

      <div className="no-drag flex items-center gap-1.5">
        {/* Quick Lock Button (Visible when password protected) */}
        {hasPassword && (
          <button
            onClick={onQuickLock}
            title={t('security.lockNow')}
            className="p-1.5 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition border border-transparent"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Security & Password Settings Button */}
        <button
          onClick={onOpenSecurity}
          title={hasPassword ? t('security.settingsTooltip') : t('security.setPasswordTooltip')}
          className={`p-1.5 rounded-md transition border border-transparent ${
            hasPassword
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/20'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          {hasPassword ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Shield className="w-3.5 h-3.5" />}
        </button>

        {/* Language Switcher */}
        <div
          className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[11px] font-semibold mr-1"
          role="group"
          aria-label={t('header.switchLanguage')}
        >
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

        <button
          onClick={onToggleCompact}
          title={isCompact ? t('header.fullMode') : t('header.compactMode')}
          className={`p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition border border-transparent ${
            isCompact ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : ''
          }`}
        >
          {isCompact ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={onTogglePin}
          title={isPinned ? t('header.unpinWindow') : t('header.pinWindow')}
          className={`p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition border border-transparent ${
            isPinned ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : ''
          }`}
        >
          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-indigo-400' : ''}`} />
        </button>
      </div>
    </header>
  )
}
