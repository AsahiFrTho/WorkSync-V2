'use client'

import { useEffect, useState } from 'react'
import { Check, Languages, Minus, Plus, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme, type Theme, type TextScale } from '@/lib/theme-context'

const themes: Array<{ value: Theme; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'contrast', label: 'High contrast' },
]

export function AccessibilityControls() {
  const { theme, setTheme, textScale, setTextScale, reducedMotion, setReducedMotion, language, setLanguage } = useTheme()
  const [open, setOpen] = useState(false)
  useEffect(() => { if (!open) return; const close = (event: MouseEvent) => { if (!(event.target as HTMLElement).closest('[data-accessibility-control]')) setOpen(false) }; document.addEventListener('click', close); return () => document.removeEventListener('click', close) }, [open])
  return <div className="relative" data-accessibility-control>
    <Button variant="outline" size="sm" type="button" aria-expanded={open} aria-controls="accessibility-panel" onClick={() => setOpen((value) => !value)}><Settings2 data-icon="inline-start" /> Accessibility</Button>
    {open && <div id="accessibility-panel" role="region" aria-label="Accessibility preferences" className="absolute right-0 top-11 z-30 flex w-72 flex-col gap-4 rounded-card border border-border bg-card p-4 shadow-overlay">
      <div className="flex flex-col gap-2"><p className="text-xs font-semibold text-foreground">Display theme</p><div className="grid grid-cols-3 gap-1">{themes.map((item) => <Button key={item.value} type="button" variant={theme === item.value ? 'default' : 'outline'} size="sm" aria-pressed={theme === item.value} onClick={() => setTheme(item.value)}>{theme === item.value && <Check data-icon="inline-start" />}{item.label}</Button>)}</div></div>
      <div className="flex flex-col gap-2"><p className="text-xs font-semibold text-foreground">Text size</p><div className="flex items-center gap-2"><Button type="button" variant="outline" size="icon-sm" aria-label="Decrease text size" disabled={textScale === 'small'} onClick={() => setTextScale(textScale === 'large' ? 'normal' : 'small')}><Minus /></Button><span className="min-w-14 text-center text-xs text-muted-foreground" aria-live="polite">{textScale === 'small' ? 'A−' : textScale === 'large' ? 'A+' : 'A'}</span><Button type="button" variant="outline" size="icon-sm" aria-label="Increase text size" disabled={textScale === 'large'} onClick={() => setTextScale(textScale === 'small' ? 'normal' : 'large')}><Plus /></Button></div></div>
      <label className="flex min-h-11 items-center justify-between gap-3 text-xs text-foreground"><span>Reduced motion</span><input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} className="size-5 accent-primary" /></label>
      <div className="flex items-center justify-between gap-3"><span className="text-xs text-foreground">Language <span className="text-muted-foreground">(partial)</span></span><Button type="button" variant="outline" size="sm" onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}><Languages data-icon="inline-start" />{language === 'en' ? 'मराठी' : 'English'}</Button></div>
    </div>}
  </div>
}
