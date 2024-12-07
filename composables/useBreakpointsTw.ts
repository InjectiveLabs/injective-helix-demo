export default function useBreakpointsTw() {
  const breakpointsTailwind = {
    sm: 640,
    md: 768,
    '2md': '800px',
    '3md': '840px',
    lg: 1024,
    xl: 1280,
    '2xl': 1366,
    '3xl': '1440px',
    '4xl': '1536px',
    '5xl': '1681px',
    '6xl': '1920px'
  }

  return useBreakpoints(breakpointsTailwind)
}
