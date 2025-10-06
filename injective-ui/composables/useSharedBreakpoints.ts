import { UIBreakpoints } from '../types'

export function useSharedBreakpoints() {
  const breakpointsTailwind = {
    '2xs': UIBreakpoints['2xs'],
    xs: UIBreakpoints.xs,
    sm: UIBreakpoints.sm,
    md: UIBreakpoints.md,
    '2md': UIBreakpoints['2md'],
    '3md': UIBreakpoints['3md'],
    lg: UIBreakpoints.lg,
    xl: UIBreakpoints.xl,
    '2xl': UIBreakpoints['2xl'],
    '3xl': UIBreakpoints['3xl'],
    '4xl': UIBreakpoints['4xl'],
    '5xl': UIBreakpoints['5xl'],
    '6xl': UIBreakpoints['6xl']
  }

  return useBreakpoints(breakpointsTailwind)
}
