import React from 'react'
import { FileText, Code2, KeyRound, Wrench, Timer } from 'lucide-react'
import { TabType } from '../types'
import { useTranslation } from '../i18n/LanguageContext'

interface NavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  notesCount: number
  snippetsCount: number
  accountsCount: number
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  notesCount,
  snippetsCount,
  accountsCount
}) => {
  const { t } = useTranslation()

  const tabs = [
    { id: 'notes' as TabType, label: t('nav.notes'), icon: FileText, count: notesCount },
    { id: 'snippets' as TabType, label: t('nav.snippets'), icon: Code2, count: snippetsCount },
    { id: 'accounts' as TabType, label: t('nav.accounts'), icon: KeyRound, count: accountsCount },
    { id: 'tools' as TabType, label: t('nav.tools'), icon: Wrench },
    { id: 'focus' as TabType, label: t('nav.focus'), icon: Timer }
  ]

  return (
    <nav className="flex bg-nav border-b border-main px-3 gap-1 select-none overflow-x-auto transition-colors duration-200">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 py-2 px-3 text-xs font-medium border-b-2 transition-all shrink-0 ${
              isActive
                ? 'border-accent text-accent bg-surface font-semibold'
                : 'border-transparent text-muted hover:text-app hover:bg-surface/50'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface border border-main text-muted">
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
