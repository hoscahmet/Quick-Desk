import React, { useState, useEffect, useRef } from 'react'
import { Header } from './components/Header'
import { Navigation } from './components/Navigation'
import { NotesTab } from './components/NotesTab'
import { SnippetsTab } from './components/SnippetsTab'
import { AccountsTab } from './components/AccountsTab'
import { ToolsTab } from './components/ToolsTab'
import { FocusTab } from './components/FocusTab'
import { Toast } from './components/Toast'
import { LockScreen } from './components/LockScreen'
import { SecurityModal } from './components/SecurityModal'
import { AppData, TabType, Note, Snippet, Account } from './types'
import { useTranslation } from './i18n/LanguageContext'

export const App: React.FC = () => {
  const { language, setLanguage, t } = useTranslation()

  const [data, setData] = useState<AppData>({
    notes: [],
    activeNoteId: null,
    snippets: [],
    todos: [],
    accounts: [],
    settings: {
      language,
      autoLockMinutes: 0
    }
  })

  const [activeTab, setActiveTab] = useState<TabType>('notes')
  const [isPinned, setIsPinned] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Security states
  const [isLocked, setIsLocked] = useState(false)
  const [hasPassword, setHasPassword] = useState(false)
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false)

  const isLoadedRef = useRef(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
    }, 2200)
  }

  // Load initial data and check security status
  useEffect(() => {
    const load = async () => {
      if (window.api) {
        try {
          const secStatus = await window.api.security.getStatus()
          setHasPassword(secStatus.hasPassword)
          if (secStatus.isEncrypted && secStatus.isLocked) {
            setIsLocked(true)
            isLoadedRef.current = true
            return
          }
        } catch (err) {
          console.error('Failed to get security status:', err)
        }

        const loaded = await window.api.getData()
        if (loaded) {
          if (loaded.isLocked) {
            setIsLocked(true)
            setHasPassword(true)
            if (loaded.settings?.language && loaded.settings.language !== language) {
              setLanguage(loaded.settings.language)
            }
          } else {
            setData(loaded)
            if (loaded.settings?.language && loaded.settings.language !== language) {
              setLanguage(loaded.settings.language)
            }
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
    if (!isLoadedRef.current || isLocked) return
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
  }, [language, isLocked])

  // Auto-save on data change
  useEffect(() => {
    if (!isLoadedRef.current || isLocked) return

    setIsSaving(true)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(async () => {
      if (window.api) {
        await window.api.saveData(data)
      }
      setIsSaving(false)
    }, 500)
  }, [data, isLocked])

  // Auto-lock on inactivity
  useEffect(() => {
    if (!hasPassword || isLocked) return

    const autoLockMinutes = data.settings?.autoLockMinutes ?? 0
    if (autoLockMinutes <= 0) return

    const timeoutMs = autoLockMinutes * 60 * 1000
    let lastActivity = Date.now()

    const onUserActivity = () => {
      lastActivity = Date.now()
    }

    const interval = setInterval(() => {
      if (Date.now() - lastActivity >= timeoutMs) {
        handleQuickLock(true)
      }
    }, 10000)

    window.addEventListener('mousemove', onUserActivity, { passive: true })
    window.addEventListener('keydown', onUserActivity, { passive: true })
    window.addEventListener('mousedown', onUserActivity, { passive: true })

    return () => {
      clearInterval(interval)
      window.removeEventListener('mousemove', onUserActivity)
      window.removeEventListener('keydown', onUserActivity)
      window.removeEventListener('mousedown', onUserActivity)
    }
  }, [hasPassword, isLocked, data.settings?.autoLockMinutes])

  // Security Handlers
  const handleUnlock = (decryptedData: AppData) => {
    setData(decryptedData)
    setIsLocked(false)
    setHasPassword(true)
    if (decryptedData.settings?.language && decryptedData.settings.language !== language) {
      setLanguage(decryptedData.settings.language)
    }
    showToast(t('security.unlockedToast'))
  }

  const handleQuickLock = async (isAuto = false) => {
    if (window.api) {
      await window.api.security.lock()
    }
    setIsLocked(true)
    showToast(isAuto ? t('security.autoLockedToast') : t('security.lockedToast'))
  }

  const handleAutoLockChange = (mins: number) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        language: prev.settings?.language || language,
        autoLockMinutes: mins
      }
    }))
  }

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

  // Accounts Actions
  const handleAddAccount = (acc: Omit<Account, 'id' | 'updatedAt'>) => {
    const newAcc: Account = {
      ...acc,
      id: 'acc_' + Date.now(),
      updatedAt: Date.now()
    }
    setData((prev) => ({
      ...prev,
      accounts: [newAcc, ...(prev.accounts || [])]
    }))
  }

  const handleUpdateAccount = (id: string, updates: Partial<Account>) => {
    setData((prev) => ({
      ...prev,
      accounts: (prev.accounts || []).map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: Date.now() } : a
      )
    }))
  }

  const handleDeleteAccount = (id: string) => {
    setData((prev) => ({
      ...prev,
      accounts: (prev.accounts || []).filter((a) => a.id !== id)
    }))
    showToast(t('accounts.accountDeletedToast'))
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

      if (isCmdOrCtrl && ['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault()
        const tabs: TabType[] = ['notes', 'snippets', 'accounts', 'tools', 'focus']
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

      if (isCmdOrCtrl && e.key.toLowerCase() === 'l' && hasPassword && !isLocked) {
        e.preventDefault()
        handleQuickLock(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasPassword, isLocked])

  // If application is locked, show Master Lock Screen
  if (isLocked) {
    return (
      <>
        <LockScreen onUnlock={handleUnlock} />
        <Toast message={toastMessage} />
      </>
    )
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0b0f19] text-slate-100 overflow-hidden">
      <Header
        isPinned={isPinned}
        isCompact={isCompact}
        isSaving={isSaving}
        hasPassword={hasPassword}
        onTogglePin={togglePin}
        onToggleCompact={toggleCompact}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
        onQuickLock={() => handleQuickLock(false)}
      />

      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notesCount={data.notes.length}
        snippetsCount={data.snippets.length}
        accountsCount={data.accounts?.length || 0}
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

        {activeTab === 'accounts' && (
          <AccountsTab
            accounts={data.accounts || []}
            hasPassword={hasPassword}
            onAddAccount={handleAddAccount}
            onUpdateAccount={handleUpdateAccount}
            onDeleteAccount={handleDeleteAccount}
            onOpenSecurity={() => setIsSecurityModalOpen(true)}
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

      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        hasPassword={hasPassword}
        autoLockMinutes={data.settings?.autoLockMinutes ?? 0}
        onPasswordSet={() => setHasPassword(true)}
        onPasswordChanged={() => {}}
        onPasswordRemoved={() => setHasPassword(false)}
        onLockNow={() => handleQuickLock(false)}
        onAutoLockChange={handleAutoLockChange}
        onToast={showToast}
      />

      <Toast message={toastMessage} />
    </div>
  )
}
