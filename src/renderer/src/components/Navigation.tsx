import React from 'react'
import { FileText, Code2, Wrench, Timer } from 'lucide-react'
import { TabType } from '../types'

interface NavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  notesCount: number
  snippetsCount: number
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  notesCount,
  snippetsCount
}) => {
  const tabs = [
    { id: 'notes' as TabType, label: 'Notlar', icon: FileText, count: notesCount },
    { id: 'snippets' as TabType, label: "Snippet'lar", icon: Code2, count: snippetsCount },
    { id: 'tools' as TabType, label: 'Araç Kutusu', icon: Wrench },
    { id: 'focus' as TabType, label: 'Odak & Görevler', icon: Timer }
  ]

  return (
    <nav className="flex bg-slate-900 border-b border-slate-800 px-3 gap-1 select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 py-2 px-3 text-xs font-medium border-b-2 transition-all ${
              isActive
                ? 'border-indigo-500 text-indigo-400 bg-slate-950 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
