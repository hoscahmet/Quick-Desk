import React from 'react'
import {
  Pin,
  Minimize2,
  Maximize2,
  Shield,
  ShieldCheck,
  Lock,
  Sun,
  Moon,
  Monitor
} from 'lucide-react'
import { useTranslation } from '../i18n/LanguageContext'
import { useTheme } from '../theme/ThemeContext'
import { Logo } from './Logo'

interface HeaderProps {
  isPinned: boolean
  isCompact: boolean
  isSaving: boolean
  hasPassword: boolean
  onTogglePin: () => void
  onToggleCompact: () => void
  onOpenSecurity: () => void
  onQuickLock: () => void
  onToast: (msg: string) => void
}

export const Header: React.FC<HeaderProps> = ({
  isPinned,
  isCompact,
  isSaving,
  hasPassword,
  onTogglePin,
  onToggleCompact,
  onOpenSecurity,
  onQuickLock,
  onToast
}) => {
  const { language, setLanguage, t } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  const handleThemeClick = () => {
    toggleTheme()
    const order = ['system', 'dark', 'light'] as const
    const nextIndex = (order.indexOf(theme) + 1) % order.length
    const nextTheme = order[nextIndex]
    onToast(t(`theme.${nextTheme}Toast`))
  }

  return (
    <header className="h-11 bg-header border-b border-main flex items-center justify-between px-3.5 z-40 select-none transition-colors duration-200">
      <div className="drag-region flex-1 h-full flex items-center pl-16">
        <div className="flex items-center gap-2">
          <Logo size={20} />
          <span className="font-semibold text-xs tracking-wide text-app">
            {t('header.appName')}
          </span>
          <span className="text-[10px] text-muted transition-opacity duration-300 ml-2">
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
            className="p-1.5 rounded-md text-muted hover:text-amber-500 hover:bg-surface transition border border-transparent"
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
              ? 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/20'
              : 'text-muted hover:text-app hover:bg-surface'
          }`}
        >
          {hasPassword ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          ) : (
            <Shield className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Theme Switcher Button (System -> Dark -> Light cycle) */}
        <button
          onClick={handleThemeClick}
          title={t('theme.toggleTooltip', { mode: t(`theme.${theme}`) })}
          className="p-1.5 rounded-md text-muted hover:text-app hover:bg-surface transition border border-transparent"
        >
          {theme === 'system' && <Monitor className="w-3.5 h-3.5" />}
          {theme === 'dark' && <Moon className="w-3.5 h-3.5 text-sky-400" />}
          {theme === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
        </button>

        {/* Language Switcher */}
        <div
          className="flex items-center bg-surface border border-main rounded-lg p-0.5 text-[11px] font-semibold mr-1"
          role="group"
          aria-label={t('header.switchLanguage')}
        >
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

        <button
          onClick={onToggleCompact}
          title={isCompact ? t('header.fullMode') : t('header.compactMode')}
          className={`p-1.5 rounded-md text-muted hover:text-app hover:bg-surface transition border border-transparent ${
            isCompact ? 'bg-accent-subtle text-accent border-accent/40' : ''
          }`}
        >
          {isCompact ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={onTogglePin}
          title={isPinned ? t('header.unpinWindow') : t('header.pinWindow')}
          className={`p-1.5 rounded-md text-muted hover:text-app hover:bg-surface transition border border-transparent ${
            isPinned ? 'bg-accent-subtle text-accent border-accent/40' : ''
          }`}
        >
          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current text-accent' : ''}`} />
        </button>
      </div>
    </header>
  )
}
