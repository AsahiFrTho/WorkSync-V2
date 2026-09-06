'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Languages, Minus, Plus, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme, type Theme, type TextScale } from '@/lib/theme-context'

const themes: Array<{ value: Theme; label: string }> = [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'contrast', label: 'High contrast' }]

export function AccessibilityControls() {
  const { theme, setTheme, textScale, setTextScale, reducedMotion, setReducedMotion, language, setLanguage } = useTheme()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { if (!open) return; const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); triggerRef.current?.focus() } }; const onPointerDown = (event: PointerEvent) => { if (!(event.target as HTMLElement).closest('[data-accessibility-control]')) { setOpen(false); triggerRef.current?.focus() } }; document.addEventListener('keydown', onKeyDown); document.addEventListener('pointerdown', onPointerDown); return () => { document.removeEventListener('keydown', onKeyDown); document.removeEventListener('pointerdown', onPointerDown) } }, [open])
  return <div className="relative" data-accessibility-control>
    <Button ref={triggerRef} variant="outline" size="sm" type="button" aria-expanded={open} aria-controls="accessibility-panel" onClick={() => setOpen((value) => !value)}><Settings2 data-icon="inline-start" /> Accessibility</Button>
    {open && <div id="accessibility-panel" role="dialog" aria-modal="false" aria-label="Accessibility preferences" className="absolute right-0 top-full mt-2 z-30 flex w-72 max-w-[calc(100vw-2rem)] flex-col gap-4 rounded-card border border-border bg-card p-4 shadow-overlay">
      <fieldset className="flex flex-col gap-2"><legend className="text-xs font-semibold text-foreground">Display theme</legend><div className="grid grid-cols-3 gap-1">{themes.map((item) => <Button key={item.value} type="button" variant={theme === item.value ? 'default' : 'outline'} size="sm" aria-pressed={theme === item.value} onClick={() => setTheme(item.value)}>{theme === item.value && <Check data-icon="inline-start" />}{item.label}</Button>)}</div></fieldset>
      <fieldset className="flex flex-col gap-2"><legend className="text-xs font-semibold text-foreground">Text size</legend><div className="flex items-center gap-2"><Button type="button" variant="outline" size="icon-sm" aria-label="Decrease text size" disabled={textScale === 'small'} onClick={() => setTextScale(textScale === 'large' ? 'normal' : 'small')}><Minus /></Button><span className="min-w-14 text-center text-xs text-muted-foreground" aria-live="polite">{textScale === 'small' ? 'Small' : textScale === 'large' ? 'Large' : 'Normal'}</span><Button type="button" variant="outline" size="icon-sm" aria-label="Increase text size" disabled={textScale === 'large'} onClick={() => setTextScale(textScale === 'small' ? 'normal' : 'large')}><Plus /></Button></div></fieldset>
      <label className="flex min-h-11 items-center justify-between gap-3 text-xs text-foreground"><span>Reduced motion</span><span className="flex items-center gap-2"><span aria-live="polite">{reducedMotion ? 'On' : 'Off'}</span><input type="checkbox" role="switch" aria-checked={reducedMotion} checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} className="size-5 accent-primary" /></span></label>
      <div className="flex items-center justify-between gap-3"><span className="text-xs text-foreground">Language <span className="text-muted-foreground">(partial)</span></span><Button type="button" variant="outline" size="sm" onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}><Languages data-icon="inline-start" />{language === 'en' ? 'मराठी' : 'English'}</Button></div>
    </div>}
  </div>
}
