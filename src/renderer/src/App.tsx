import React, { useState, useEffect, useRef } from 'react'
import { Header } from './components/Header'
import { Navigation } from './components/Navigation'
import { NotesTab } from './components/NotesTab'
import { SnippetsTab } from './components/SnippetsTab'
import { ToolsTab } from './components/ToolsTab'
import { FocusTab } from './components/FocusTab'
import { Toast } from './components/Toast'
import { AppData, TabType, Note, Snippet } from './types'
import { useTranslation } from './i18n/LanguageContext'

export const App: React.FC = () => {
  const { language, setLanguage, t } = useTranslation()

  const [data, setData] = useState<AppData>({
    notes: [],
    activeNoteId: null,
    snippets: [],
    todos: [],
    settings: {
      language
    }
  })

  const [activeTab, setActiveTab] = useState<TabType>('notes')
  const [isPinned, setIsPinned] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const isLoadedRef = useRef(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
    }, 2200)
  }

  // Load initial data
  useEffect(() => {
    const load = async () => {
      if (window.api) {
        const loaded = await window.api.getData()
        if (loaded) {
          setData(loaded)
          if (loaded.settings?.language && loaded.settings.language !== language) {
            setLanguage(loaded.settings.language)
          }
        }
        const pinned = await window.api.isAlwaysOnTop()
        setIsPinned(pinned)
      }
      isLoadedRef.current = true
    }
    load()
  }, [])

  // Sync language changes into AppData for persistence
  useEffect(() => {
    if (!isLoadedRef.current) return
    setData((prev) => {
      if (prev.settings?.language === language) return prev
      return {
        ...prev,
        settings: {
          ...prev.settings,
          language
        }
      }
    })
  }, [language])

  // Auto-save on data change
  useEffect(() => {
    if (!isLoadedRef.current) return

    setIsSaving(true)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(async () => {
      if (window.api) {
        await window.api.saveData(data)
      }
      setIsSaving(false)
    }, 500)
  }, [data])

  // Window Controls
  const togglePin = async () => {
    if (window.api) {
      const pinned = await window.api.toggleAlwaysOnTop()
      setIsPinned(pinned)
      showToast(pinned ? t('header.pinnedToast') : t('header.unpinnedToast'))
    }
  }

  const toggleCompact = async () => {
    if (window.api) {
      const compact = await window.api.toggleCompact()
      setIsCompact(compact)
      showToast(compact ? t('header.compactToast') : t('header.normalModeToast'))
    }
  }

  // Notes Actions
  const handleSelectNote = (id: string) => {
    setData((prev) => ({ ...prev, activeNoteId: id }))
  }

  const handleAddNote = () => {
    const newNote: Note = {
      id: 'note_' + Date.now(),
      title: t('notes.defaultTitle'),
      content: '',
      updatedAt: Date.now()
    }
    setData((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes],
      activeNoteId: newNote.id
    }))
    showToast(t('notes.noteCreated'))
  }

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n))
    }))
  }

  const handleDeleteNote = (id: string) => {
    if (data.notes.length <= 1) {
      showToast(t('notes.minOneNoteWarning'))
      return
    }
    setData((prev) => {
      const filtered = prev.notes.filter((n) => n.id !== id)
      return {
        ...prev,
        notes: filtered,
        activeNoteId: filtered[0]?.id || null
      }
    })
    showToast(t('notes.noteDeleted'))
  }

  // Snippets Actions
  const handleAddSnippet = (snippet: Omit<Snippet, 'id'>) => {
    const newSnip: Snippet = {
      ...snippet,
      id: 'snip_' + Date.now()
    }
    setData((prev) => ({
      ...prev,
      snippets: [newSnip, ...prev.snippets]
    }))
  }

  const handleDeleteSnippet = (id: string) => {
    setData((prev) => ({
      ...prev,
      snippets: prev.snippets.filter((s) => s.id !== id)
    }))
    showToast(t('snippets.snippetDeleted'))
  }

  // Todos Actions
  const handleAddTodo = (text: string) => {
    const newTodo = {
      id: 'todo_' + Date.now(),
      text,
      done: false
    }
    setData((prev) => ({
      ...prev,
      todos: [...prev.todos, newTodo]
    }))
  }

  const handleToggleTodo = (id: string) => {
    setData((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    }))
  }

  const handleDeleteTodo = (id: string) => {
    setData((prev) => ({
      ...prev,
      todos: prev.todos.filter((t) => t.id !== id)
    }))
  }

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey

      if (isCmdOrCtrl && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault()
        const tabs: TabType[] = ['notes', 'snippets', 'tools', 'focus']
        setActiveTab(tabs[parseInt(e.key) - 1])
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        setActiveTab('notes')
        handleAddNote()
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        togglePin()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0b0f19] text-slate-100 overflow-hidden">
      <Header
        isPinned={isPinned}
        isCompact={isCompact}
        isSaving={isSaving}
        onTogglePin={togglePin}
        onToggleCompact={toggleCompact}
      />

      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notesCount={data.notes.length}
        snippetsCount={data.snippets.length}
      />

      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'notes' && (
          <NotesTab
            notes={data.notes}
            activeNoteId={data.activeNoteId}
            onSelectNote={handleSelectNote}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            onToast={showToast}
          />
        )}

        {activeTab === 'snippets' && (
          <SnippetsTab
            snippets={data.snippets}
            onAddSnippet={handleAddSnippet}
            onDeleteSnippet={handleDeleteSnippet}
            onToast={showToast}
          />
        )}

        {activeTab === 'tools' && <ToolsTab onToast={showToast} />}

        {activeTab === 'focus' && (
          <FocusTab
            todos={data.todos}
            onAddTodo={handleAddTodo}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
            onToast={showToast}
          />
        )}
      </main>

      <Toast message={toastMessage} />
    </div>
  )
}
