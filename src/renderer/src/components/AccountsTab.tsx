import React, { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  KeyRound,
  User,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Trash2,
  Edit2,
  X,
  ShieldAlert,
  Sparkles,
  Globe,
  FileText
} from 'lucide-react'
import { Account } from '../types'
import { useTranslation } from '../i18n/LanguageContext'

interface AccountsTabProps {
  accounts: Account[]
  hasPassword: boolean
  onAddAccount: (acc: Omit<Account, 'id' | 'updatedAt'>) => void
  onUpdateAccount: (id: string, updates: Partial<Account>) => void
  onDeleteAccount: (id: string) => void
  onOpenSecurity: () => void
  onToast: (msg: string) => void
}

export const AccountsTab: React.FC<AccountsTabProps> = ({
  accounts,
  hasPassword,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onOpenSecurity,
  onToast
}) => {
  const { t } = useTranslation()

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({})

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [modalTitle, setModalTitle] = useState('')
  const [modalUsername, setModalUsername] = useState('')
  const [modalPassword, setModalPassword] = useState('')
  const [modalCategory, setModalCategory] = useState('')
  const [modalWebsite, setModalWebsite] = useState('')
  const [modalNotes, setModalNotes] = useState('')
  const [modalShowPassword, setModalShowPassword] = useState(false)

  // Default category presets
  const categoryPresets = [
    t('accounts.categoryGeneral'),
    t('accounts.categoryDev'),
    t('accounts.categoryEmail'),
    t('accounts.categoryFinance'),
    t('accounts.categorySocial'),
    t('accounts.categoryWork')
  ]

  // All unique categories in database
  const allCategories = useMemo(() => {
    const set = new Set<string>()
    accounts.forEach((a) => {
      if (a.category) set.add(a.category)
    })
    return Array.from(set)
  }, [accounts])

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const q = search.toLowerCase().trim()
      const matchesSearch =
        !q ||
        acc.title.toLowerCase().includes(q) ||
        acc.username.toLowerCase().includes(q) ||
        acc.category.toLowerCase().includes(q) ||
        (acc.website && acc.website.toLowerCase().includes(q)) ||
        (acc.notes && acc.notes.toLowerCase().includes(q))

      const matchesCat =
        selectedCategory === 'ALL' || acc.category.toLowerCase() === selectedCategory.toLowerCase()

      return matchesSearch && matchesCat
    })
  }, [accounts, search, selectedCategory])

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleCopy = async (text: string, label: string) => {
    if (!text) return
    await window.api.copyToClipboard(text)
    onToast(label)
  }

  // Password Generator for Modal
  const generateStrongPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-='
    let res = ''
    for (let i = 0; i < 20; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setModalPassword(res)
    setModalShowPassword(true)
    onToast(t('accounts.passwordCopied'))
    window.api.copyToClipboard(res)
  }

  const openAddModal = () => {
    setEditingId(null)
    setModalTitle('')
    setModalUsername('')
    setModalPassword('')
    setModalCategory(t('accounts.categoryGeneral'))
    setModalWebsite('')
    setModalNotes('')
    setModalShowPassword(false)
    setIsModalOpen(true)
  }

  const openEditModal = (acc: Account) => {
    setEditingId(acc.id)
    setModalTitle(acc.title)
    setModalUsername(acc.username)
    setModalPassword(acc.password)
    setModalCategory(acc.category || t('accounts.categoryGeneral'))
    setModalWebsite(acc.website || '')
    setModalNotes(acc.notes || '')
    setModalShowPassword(false)
    setIsModalOpen(true)
  }

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalTitle.trim() || !modalPassword.trim()) {
      onToast(t('accounts.fillRequired'))
      return
    }

    const payload = {
      title: modalTitle.trim(),
      username: modalUsername.trim(),
      password: modalPassword.trim(),
      category: modalCategory.trim() || t('accounts.categoryGeneral'),
      website: modalWebsite.trim() || undefined,
      notes: modalNotes.trim() || undefined
    }

    if (editingId) {
      onUpdateAccount(editingId, payload)
      onToast(t('accounts.accountUpdatedToast'))
    } else {
      onAddAccount(payload)
      onToast(t('accounts.accountAddedToast'))
    }

    setIsModalOpen(false)
  }

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden gap-3.5 bg-app">
      {/* Warning banner if Master Password not set */}
      {!hasPassword && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-amber-500 dark:text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500 dark:text-amber-400" />
            <span>{t('accounts.unencryptedWarning')}</span>
          </div>
          <button
            onClick={onOpenSecurity}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-600 dark:text-amber-300 font-semibold text-[11px] shrink-0 transition"
          >
            {t('security.setPasswordTooltip')}
          </button>
        </div>
      )}

      {/* Search and Action Bar */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('accounts.searchPlaceholder')}
            className="w-full bg-card border border-main rounded-lg pl-8 pr-3 py-1.5 text-xs text-app placeholder:text-muted outline-none focus:border-accent"
          />
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium text-xs transition shrink-0 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('accounts.newAccount')}</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 text-xs">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-2.5 py-1 rounded-lg transition shrink-0 ${
            selectedCategory === 'ALL'
              ? 'bg-accent text-white font-semibold shadow-sm'
              : 'bg-card text-secondary hover:text-app border border-main hover:bg-surface'
          }`}
        >
          {t('accounts.categoryAll')} ({accounts.length})
        </button>
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-lg transition shrink-0 ${
              selectedCategory.toLowerCase() === cat.toLowerCase()
                ? 'bg-accent text-white font-semibold shadow-sm'
                : 'bg-card text-secondary hover:text-app border border-main hover:bg-surface'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accounts List / Grid */}
      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-4">
        {filteredAccounts.map((acc) => {
          const isRevealed = Boolean(visiblePasswords[acc.id])
          return (
            <div
              key={acc.id}
              className="bg-card border border-main rounded-xl p-4 flex flex-col gap-3 hover:border-accent/40 shadow-app-card transition relative group"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-7 h-7 rounded-lg bg-accent-subtle text-accent flex items-center justify-center shrink-0 font-bold text-xs">
                    {acc.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <h4 className="font-semibold text-xs text-app truncate">{acc.title}</h4>
                    {acc.website && (
                      <a
                        href={acc.website.startsWith('http') ? acc.website : `https://${acc.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-accent hover:underline flex items-center gap-1 truncate"
                      >
                        <Globe className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{acc.website.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    )}
                  </div>
                </div>

                <span className="text-[10px] font-medium bg-surface text-secondary border border-main px-2 py-0.5 rounded-full shrink-0">
                  {acc.category}
                </span>
              </div>

              {/* Username row */}
              {acc.username && (
                <div className="flex items-center justify-between bg-surface/60 border border-main rounded-lg px-2.5 py-1.5 text-xs">
                  <div className="flex items-center gap-2 truncate text-secondary">
                    <User className="w-3.5 h-3.5 text-muted shrink-0" />
                    <span className="truncate select-all font-mono text-[11px]">{acc.username}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(acc.username, t('accounts.usernameCopied'))}
                    title={t('accounts.copyUsername')}
                    className="p-1 rounded text-muted hover:text-app hover:bg-surface transition"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Password row */}
              <div className="flex items-center justify-between bg-surface/60 border border-main rounded-lg px-2.5 py-1.5 text-xs">
                <div className="flex items-center gap-2 truncate text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                  <KeyRound className="w-3.5 h-3.5 text-muted shrink-0" />
                  <span className="truncate select-all">
                    {isRevealed ? acc.password : '••••••••••••'}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => togglePasswordVisibility(acc.id)}
                    className="p-1 rounded text-muted hover:text-app hover:bg-surface transition"
                  >
                    {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => handleCopy(acc.password, t('accounts.passwordCopied'))}
                    title={t('accounts.copyPassword')}
                    className="p-1 rounded text-muted hover:text-app hover:bg-surface transition"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Notes preview if available */}
              {acc.notes && (
                <div className="text-[11px] text-muted bg-surface/40 border border-main/50 p-2 rounded-lg flex items-start gap-1.5">
                  <FileText className="w-3 h-3 text-muted shrink-0 mt-0.5" />
                  <span className="truncate">{acc.notes}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-1 pt-1 border-t border-main">
                <button
                  onClick={() => openEditModal(acc)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface hover:bg-nav text-secondary hover:text-app border border-main text-[11px] font-medium transition"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{t('accounts.editAccount')}</span>
                </button>
                <button
                  onClick={() => onDeleteAccount(acc.id)}
                  title={t('common.delete')}
                  className="p-1.5 rounded text-muted hover:text-rose-500 hover:bg-rose-500/10 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}

        {filteredAccounts.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted gap-2">
            <KeyRound className="w-10 h-10 opacity-30 text-accent" />
            <p className="text-xs font-medium text-muted">
              {accounts.length === 0
                ? t('accounts.emptyStateDesc')
                : t('accounts.noAccountsFound')}
            </p>
            {accounts.length === 0 && (
              <button
                onClick={openAddModal}
                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('accounts.newAccount')}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
          <div className="bg-card border border-main rounded-2xl w-full max-w-md p-5 flex flex-col gap-3.5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-2.5 border-b border-main">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-accent-subtle text-accent flex items-center justify-center">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-semibold text-app">
                  {editingId ? t('accounts.editAccount') : t('accounts.newAccount')}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-app transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="flex flex-col gap-3">
              {/* Title & Category in 2 cols */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-muted">
                    {t('accounts.fieldTitle')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    placeholder={t('accounts.fieldTitlePlaceholder')}
                    className="bg-input border border-main rounded-lg px-3 py-1.5 text-xs text-app outline-none focus:border-accent"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-muted">
                    {t('accounts.fieldCategory')}
                  </label>
                  <input
                    type="text"
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value)}
                    list="category-suggestions"
                    placeholder={t('accounts.categoryGeneral')}
                    className="bg-input border border-main rounded-lg px-3 py-1.5 text-xs text-app outline-none focus:border-accent"
                  />
                  <datalist id="category-suggestions">
                    {categoryPresets.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Username */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-muted">
                  {t('accounts.fieldUsername')}
                </label>
                <input
                  type="text"
                  value={modalUsername}
                  onChange={(e) => setModalUsername(e.target.value)}
                  placeholder={t('accounts.fieldUsernamePlaceholder')}
                  className="bg-input border border-main rounded-lg px-3 py-1.5 text-xs text-app outline-none focus:border-accent"
                />
              </div>

              {/* Password with generator */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-muted">
                    {t('accounts.fieldPassword')} *
                  </label>
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    className="text-[10px] text-accent hover:underline font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{t('accounts.generatePasswordBtn')}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={modalShowPassword ? 'text' : 'password'}
                    required
                    value={modalPassword}
                    onChange={(e) => setModalPassword(e.target.value)}
                    placeholder={t('accounts.fieldPasswordPlaceholder')}
                    className="w-full bg-input border border-main rounded-lg pl-3 pr-8 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setModalShowPassword(!modalShowPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-app"
                  >
                    {modalShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Website */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-muted">
                  {t('accounts.fieldWebsite')}
                </label>
                <input
                  type="text"
                  value={modalWebsite}
                  onChange={(e) => setModalWebsite(e.target.value)}
                  placeholder={t('accounts.fieldWebsitePlaceholder')}
                  className="bg-input border border-main rounded-lg px-3 py-1.5 text-xs text-app outline-none focus:border-accent"
                />
              </div>

              {/* Notes / 2FA */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-muted">
                  {t('accounts.fieldNotes')}
                </label>
                <textarea
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder={t('accounts.fieldNotesPlaceholder')}
                  className="bg-input border border-main rounded-lg p-2.5 text-xs text-app h-16 resize-none outline-none focus:border-accent"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-2 border-t border-main">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-app transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium text-xs transition shadow-sm"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
