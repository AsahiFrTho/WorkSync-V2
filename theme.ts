export type ChartTheme = 'light' | 'dark' | 'contrast'

const palettes = {
  light: { brand: '#1F497D', canvas: '#FAF9F7', surface: '#F3F1ED', ink: '#252321', muted: '#59544F', verified: '#557A62', pending: '#A87932', atRisk: '#A45F55', chart: ['#1F497D', '#496989', '#71889D', '#7D8E98', '#A1AAA8'] },
  dark: { brand: '#9FC5E8', canvas: '#211F1C', surface: '#2D2A26', ink: '#F2EEE8', muted: '#C7BFB5', verified: '#8DC69D', pending: '#E0B765', atRisk: '#E29A91', chart: ['#9FC5E8', '#83A9C9', '#A9BFD2', '#C2CCC9', '#D9D1C5'] },
  contrast: { brand: '#8EC5FF', canvas: '#050505', surface: '#141414', ink: '#FFFFFF', muted: '#F0F0F0', verified: '#7DFF9B', pending: '#FFD166', atRisk: '#FF8C8C', chart: ['#8EC5FF', '#7DFF9B', '#FFD166', '#FF8C8C', '#FFFFFF'] },
} as const

export const theme = { colors: palettes.light, typography: { display: 'Source Serif 4', sans: 'Inter', mono: 'Geist Mono' } } as const
export const chartTheme = (mode: ChartTheme = 'light') => palettes[mode]
export const CHART_SERIES = palettes.light.chart
export const CHART_SEMANTIC = { verified: palettes.light.verified, pending: palettes.light.pending, atRisk: palettes.light.atRisk } as const
export const chartColors = CHART_SERIES
export type Theme = typeof theme
