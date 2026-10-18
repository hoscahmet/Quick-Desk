export type Language = 'tr' | 'en'

export interface AppSettings {
  language: Language
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

export interface AppData {
  notes: Note[]
  activeNoteId: string | null
  snippets: Snippet[]
  todos: Todo[]
  settings?: AppSettings
}

export type TabType = 'notes' | 'snippets' | 'tools' | 'focus'
