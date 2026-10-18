import React from 'react'
import { Plus, Copy, Trash2, FileText } from 'lucide-react'
import { Note } from '../types'
import { useTranslation } from '../i18n/LanguageContext'

interface NotesTabProps {
  notes: Note[]
  activeNoteId: string | null
  onSelectNote: (id: string) => void
  onAddNote: () => void
  onUpdateNote: (id: string, updates: Partial<Note>) => void
  onDeleteNote: (id: string) => void
  onToast: (msg: string) => void
}

export const NotesTab: React.FC<NotesTabProps> = ({
  notes,
  activeNoteId,
  onSelectNote,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onToast
}) => {
  const { t } = useTranslation()
  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0]

  const charCount = activeNote?.content?.length || 0
  const wordCount = activeNote?.content?.trim()
    ? activeNote.content.trim().split(/\s+/).length
    : 0

  const handleCopy = async () => {
    if (!activeNote || !activeNote.content) {
      onToast(t('notes.noContentToCopy'))
      return
    }
    await window.api.copyToClipboard(activeNote.content)
    onToast(t('notes.copySuccess'))
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar List */}
      <aside className="w-56 bg-nav border-r border-main flex flex-col shrink-0">
        <div className="flex items-center justify-between p-3 border-b border-main">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
            {t('notes.myNotes')}
          </span>
          <button
            onClick={onAddNote}
            title={t('notes.addNewNote')}
            className="p-1 rounded text-muted hover:text-app hover:bg-surface transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {notes.map((note) => {
            const isSelected = note.id === (activeNote?.id ?? '')
            return (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`p-2 rounded-lg cursor-pointer transition flex flex-col gap-0.5 ${
                  isSelected
                    ? 'bg-accent-subtle border-l-2 border-accent text-app font-medium'
                    : 'hover:bg-surface text-secondary'
                }`}
              >
                <div className="text-xs font-medium truncate">
                  {note.title || t('notes.untitledNote')}
                </div>
                <div className="text-[10px] text-muted truncate">
                  {note.content ? note.content.slice(0, 40) : t('notes.emptyNote')}
                </div>
              </div>
            )
          })}
        </div>
      </aside>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-app overflow-hidden">
        {activeNote ? (
          <>
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-main shrink-0">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => onUpdateNote(activeNote.id, { title: e.target.value })}
                placeholder={t('notes.titlePlaceholder')}
                className="bg-transparent text-sm font-semibold text-app outline-none flex-1 placeholder:text-muted"
              />
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[11px] text-muted mr-2">
                  {t('notes.stats', { chars: charCount, words: wordCount })}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-card hover:bg-surface border border-main text-secondary hover:text-app transition text-[11.5px]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t('common.copy')}</span>
                </button>
                <button
                  onClick={() => onDeleteNote(activeNote.id)}
                  title={t('notes.deleteNote')}
                  className="p-1 rounded bg-card hover:bg-rose-500/10 border border-main hover:border-rose-500/40 text-muted hover:text-rose-500 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              value={activeNote.content}
              onChange={(e) => onUpdateNote(activeNote.id, { content: e.target.value })}
              placeholder={t('notes.contentPlaceholder')}
              className="flex-1 p-4 bg-transparent text-secondary font-sans text-xs sm:text-sm leading-relaxed resize-none outline-none placeholder:text-muted"
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted gap-2">
            <FileText className="w-8 h-8 opacity-40" />
            <p className="text-xs">{t('notes.noNoteSelected')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
