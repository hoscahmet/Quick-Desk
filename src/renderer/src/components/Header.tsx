import React from 'react'
import { Zap, Pin, Minimize2, Maximize2 } from 'lucide-react'

interface HeaderProps {
  isPinned: boolean
  isCompact: boolean
  isSaving: boolean
  onTogglePin: () => void
  onToggleCompact: () => void
}

export const Header: React.FC<HeaderProps> = ({
  isPinned,
  isCompact,
  isSaving,
  onTogglePin,
  onToggleCompact
}) => {
  return (
    <header className="h-11 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between px-3.5 z-40 select-none">
      <div className="drag-region flex-1 h-full flex items-center pl-16">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
            <Zap className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
          </div>
          <span className="font-semibold text-xs tracking-wide text-slate-100">QuickDesk</span>
          <span className="text-[10px] text-slate-500 transition-opacity duration-300 ml-2">
            {isSaving ? 'Kaydediliyor...' : 'Otomatik Kaydedildi'}
          </span>
        </div>
      </div>

      <div className="no-drag flex items-center gap-1.5">
        <button
          onClick={onToggleCompact}
          title={isCompact ? 'Tam Boyuta Geç' : 'Kompakt Not Moduna Geç'}
          className={`p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition border border-transparent ${
            isCompact ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : ''
          }`}
        >
          {isCompact ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={onTogglePin}
          title={isPinned ? 'Sabitlemeyi Kaldır' : 'Her Zaman Üstte Tut'}
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
