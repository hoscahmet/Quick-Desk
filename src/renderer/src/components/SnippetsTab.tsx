import React, { useState } from 'react'
import { Plus, Search, Copy, Trash2, X } from 'lucide-react'
import { Snippet } from '../types'
import { useTranslation } from '../i18n/LanguageContext'

interface SnippetsTabProps {
  snippets: Snippet[]
  onAddSnippet: (snippet: Omit<Snippet, 'id'>) => void
  onDeleteSnippet: (id: string) => void
  onToast: (msg: string) => void
}

export const SnippetsTab: React.FC<SnippetsTabProps> = ({
  snippets,
  onAddSnippet,
  onDeleteSnippet,
  onToast
}) => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newCode, setNewCode] = useState('')

  const filtered = snippets.filter((s) => {
    const q = search.toLowerCase()
    return (
      s.title.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q)
    )
  })

  const handleCopy = async (code: string, title: string) => {
    await window.api.copyToClipboard(code)
    onToast(t('snippets.copiedToast', { title }))
  }

  const handleSave = () => {
    if (!newTitle.trim() || !newCode.trim()) {
      onToast(t('snippets.fillRequiredFields'))
      return
    }
    onAddSnippet({
      title: newTitle.trim(),
      category: newCategory.trim() || t('snippets.defaultCategory'),
      code: newCode.trim()
    })
    setNewTitle('')
    setNewCategory('')
    setNewCode('')
    setIsModalOpen(false)
    onToast(t('snippets.snippetAdded'))
  }

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden gap-3.5 bg-slate-950">
      {/* Search and Action Bar */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('snippets.searchPlaceholder')}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('snippets.newSnippet')}</span>
        </button>
      </div>

      {/* Snippets Grid */}
      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-4">
        {filtered.map((snip) => (
          <div
            key={snip.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2.5 hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-xs text-slate-200 truncate">{snip.title}</span>
              <span className="text-[10px] font-medium bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded-full shrink-0">
                {snip.category}
              </span>
            </div>

            <pre className="bg-slate-950 border border-slate-800/80 rounded-lg p-2.5 font-mono text-[11px] text-sky-400 max-h-24 overflow-y-auto whitespace-pre-wrap break-all">
              {snip.code}
            </pre>

            <div className="flex items-center justify-end gap-1.5 pt-1">
              <button
                onClick={() => handleCopy(snip.code, snip.title)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition"
              >
                <Copy className="w-3 h-3" />
                <span>{t('common.copy')}</span>
              </button>
              <button
                onClick={() => onDeleteSnippet(snip.id)}
                title={t('snippets.deleteSnippet')}
                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 text-xs">
            {t('snippets.noSnippetsFound')}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100">{t('snippets.modalTitle')}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-slate-400 font-medium">
                {t('snippets.titleLabel')}
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t('snippets.titlePlaceholder')}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-slate-400 font-medium">
                {t('snippets.categoryLabel')}
              </label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder={t('snippets.categoryPlaceholder')}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-slate-400 font-medium">
                {t('snippets.codeLabel')}
              </label>
              <textarea
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder={t('snippets.codePlaceholder')}
                className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-sky-400 h-28 resize-none outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSave}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
