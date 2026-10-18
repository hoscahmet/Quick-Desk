import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { Language } from '../types'
import { getTranslation } from './translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (path: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  initialLanguage?: Language
  onLanguageChange?: (lang: Language) => void
  children: React.ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  initialLanguage,
  onLanguageChange,
  children
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (initialLanguage) return initialLanguage
    const saved = localStorage.getItem('quickdesk_language') as Language | null
    if (saved === 'tr' || saved === 'en') return saved
    if (navigator.language && navigator.language.toLowerCase().startsWith('en')) return 'en'
    return 'tr'
  })

  useEffect(() => {
    if (initialLanguage && (initialLanguage === 'tr' || initialLanguage === 'en')) {
      setLanguageState(initialLanguage)
    }
  }, [initialLanguage])

  useEffect(() => {
    document.documentElement.lang = language
    try {
      localStorage.setItem('quickdesk_language', language)
    } catch {
      // ignore storage errors
    }
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem('quickdesk_language', lang)
    } catch {
      // ignore storage errors
    }
    if (onLanguageChange) {
      onLanguageChange(lang)
    }
  }

  const value = useMemo<LanguageContextType>(() => {
    return {
      language,
      setLanguage,
      t: (path: string, params?: Record<string, string | number>) =>
        getTranslation(language, path, params)
    }
  }, [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}

export const useLanguage = useTranslation
