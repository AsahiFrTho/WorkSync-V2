'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'contrast'
export type TextScale = 'small' | 'normal' | 'large'
export type Language = 'en' | 'mr'

type ThemeContextType = { theme: Theme; setTheme: (theme: Theme) => void; toggleTheme: () => void; textScale: TextScale; setTextScale: (scale: TextScale) => void; reducedMotion: boolean; setReducedMotion: (value: boolean) => void; language: Language; setLanguage: (language: Language) => void }
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function getMediaPreference(query: string) { return typeof window !== 'undefined' && window.matchMedia(query).matches }

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [textScale, setTextScale] = useState<TextScale>('normal')
  const [reducedMotion, setReducedMotion] = useState(false)
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true); const savedTheme = localStorage.getItem('worksync-theme') as Theme | null; setTheme(savedTheme ?? (getMediaPreference('(prefers-contrast: more)') ? 'contrast' : getMediaPreference('(prefers-color-scheme: light)') ? 'light' : 'dark')); setTextScale((localStorage.getItem('worksync-text-scale') as TextScale | null) ?? 'normal'); setReducedMotion(localStorage.getItem('worksync-reduced-motion') === 'true' || getMediaPreference('(prefers-reduced-motion: reduce)')); setLanguage((localStorage.getItem('worksync-language') as Language | null) ?? 'en') }, [])
  useEffect(() => { if (!mounted) return; const root = document.documentElement; root.classList.remove('light', 'dark', 'contrast'); root.classList.add(theme); root.dataset.textScale = textScale; root.dataset.reducedMotion = String(reducedMotion); localStorage.setItem('worksync-theme', theme); localStorage.setItem('worksync-text-scale', textScale); localStorage.setItem('worksync-reduced-motion', String(reducedMotion)); localStorage.setItem('worksync-language', language) }, [theme, textScale, reducedMotion, language, mounted])
  if (!mounted) return <>{children}</>
  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme: () => setTheme((prev) => prev === 'dark' ? 'light' : 'dark'), textScale, setTextScale, reducedMotion, setReducedMotion, language, setLanguage }}>{children}</ThemeContext.Provider>
}

export function useTheme() { return useContext(ThemeContext) ?? { theme: 'dark' as Theme, setTheme: () => {}, toggleTheme: () => {}, textScale: 'normal' as TextScale, setTextScale: () => {}, reducedMotion: false, setReducedMotion: () => {}, language: 'en' as Language, setLanguage: () => {} } }
