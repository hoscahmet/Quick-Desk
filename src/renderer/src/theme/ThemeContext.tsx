import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { Theme } from '../types'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'dark' | 'light'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  initialTheme?: Theme
  onThemeChange?: (theme: Theme) => void
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  initialTheme,
  onThemeChange,
  children
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (initialTheme) return initialTheme
    const saved = localStorage.getItem('quickdesk_theme') as Theme | null
    if (saved === 'system' || saved === 'dark' || saved === 'light') return saved
    return 'system'
  })

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    return window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : true
  })

  // Listen to OS system theme changes
  useEffect(() => {
    if (!window.matchMedia) return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (initialTheme && (initialTheme === 'system' || initialTheme === 'dark' || initialTheme === 'light')) {
      setThemeState(initialTheme)
    }
  }, [initialTheme])

  const resolvedTheme: 'dark' | 'light' = useMemo(() => {
    if (theme === 'system') {
      return systemIsDark ? 'dark' : 'light'
    }
    return theme
  }, [theme, systemIsDark])

  // Apply .dark or .light class on html root element
  useEffect(() => {
    const root = document.documentElement
    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }

    try {
      localStorage.setItem('quickdesk_theme', theme)
    } catch {
      // ignore
    }
  }, [resolvedTheme, theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem('quickdesk_theme', newTheme)
    } catch {
      // ignore
    }
    if (onThemeChange) {
      onThemeChange(newTheme)
    }
  }

  const toggleTheme = () => {
    // Cycle: system -> dark -> light -> system
    const order: Theme[] = ['system', 'dark', 'light']
    const nextIndex = (order.indexOf(theme) + 1) % order.length
    setTheme(order[nextIndex])
  }

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme
    }),
    [theme, resolvedTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
