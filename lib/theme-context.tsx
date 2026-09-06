'use client'

import { createContext, useContext, useLayoutEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'contrast'
export type TextScale = 'small' | 'normal' | 'large'
export type Language = 'en' | 'mr'

type ThemeContextType = { theme: Theme; setTheme: (theme: Theme) => void; toggleTheme: () => void; textScale: TextScale; setTextScale: (scale: TextScale) => void; reducedMotion: boolean; setReducedMotion: (value: boolean) => void; language: Language; setLanguage: (language: Language) => void }
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)
const isTheme = (value: string | null): value is Theme => value === 'light' || value === 'dark' || value === 'contrast'
const isScale = (value: string | null): value is TextScale => value === 'small' || value === 'normal' || value === 'large'

function preferredTheme(): Theme {
  if (window.matchMedia('(prefers-contrast: more)').matches) return 'contrast'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyPreferences(theme: Theme, textScale: TextScale, reducedMotion: boolean) {
  const root = document.documentElement
  root.dataset.theme = theme
  root.dataset.textScale = textScale
  root.dataset.reducedMotion = String(reducedMotion)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => typeof window !== 'undefined' && isTheme(localStorage.getItem('worksync-theme')) ? localStorage.getItem('worksync-theme') as Theme : 'light')
  const [textScale, setTextScaleState] = useState<TextScale>(() => typeof window !== 'undefined' && isScale(localStorage.getItem('worksync-text-scale')) ? localStorage.getItem('worksync-text-scale') as TextScale : 'normal')
  const [reducedMotion, setReducedMotionState] = useState(() => typeof window !== 'undefined' && (localStorage.getItem('worksync-reduced-motion') === 'true' || window.matchMedia('(prefers-reduced-motion: reduce)').matches))
  const [language, setLanguageState] = useState<Language>(() => typeof window !== 'undefined' && localStorage.getItem('worksync-language') === 'mr' ? 'mr' : 'en')
  useLayoutEffect(() => { applyPreferences(theme, textScale, reducedMotion) }, [theme, textScale, reducedMotion])
  const setTheme = (value: Theme) => { setThemeState(value); localStorage.setItem('worksync-theme', value) }
  const setTextScale = (value: TextScale) => { setTextScaleState(value); localStorage.setItem('worksync-text-scale', value) }
  const setReducedMotion = (value: boolean) => { setReducedMotionState(value); localStorage.setItem('worksync-reduced-motion', String(value)) }
  const setLanguage = (value: Language) => { setLanguageState(value); localStorage.setItem('worksync-language', value) }
  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'), textScale, setTextScale, reducedMotion, setReducedMotion, language, setLanguage }}>{children}</ThemeContext.Provider>
}

export function useTheme() { return useContext(ThemeContext)! }
