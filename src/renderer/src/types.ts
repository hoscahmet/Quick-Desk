export type Language = 'tr' | 'en'

export interface AppSettings {
  language: Language
  autoLockMinutes?: number
}

export interface SecurityStatus {
  hasPassword: boolean
  isLocked: boolean
  isEncrypted: boolean
}

export interface Note {
  id: string
  title: string
  content: string
  updatedAt: number
}

export interface Snippet {
  id: string
  title: string
  category: string
  code: string
}

export interface Todo {
  id: string
  text: string
  done: boolean
}

export interface Account {
  id: string
  title: string
  username: string
  password: string
  category: string
  website?: string
  notes?: string
  updatedAt: number
}

export interface AppData {
  notes: Note[]
  activeNoteId: string | null
  snippets: Snippet[]
  todos: Todo[]
  accounts?: Account[]
  settings?: AppSettings
}

export type TabType = 'notes' | 'snippets' | 'accounts' | 'tools' | 'focus'
