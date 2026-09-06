// Mirror of the semantic tokens in app/globals.css. Keep chart values as JS strings for Recharts.
export const theme = {
  colors: {
    brand: '#1F497D',
    canvas: '#FAF9F7',
    surface: '#F3F1ED',
    ink: '#252321',
    muted: '#6F6A63',
    accent: '#B7863B',
    verified: '#557A62',
    pending: '#A87932',
    atRisk: '#A45F55',
    chart: ['#1F497D', '#496989', '#71889D', '#9AA8B2', '#C1C8CA'],
  },
  typography: { display: 'Source Serif 4', sans: 'Geist', mono: 'Geist Mono' },
} as const

export const CHART_SERIES = theme.colors.chart
export const CHART_SEMANTIC = {
  verified: theme.colors.verified,
  pending: theme.colors.pending,
  atRisk: theme.colors.atRisk,
} as const
export const chartColors = CHART_SERIES
export type Theme = typeof theme
