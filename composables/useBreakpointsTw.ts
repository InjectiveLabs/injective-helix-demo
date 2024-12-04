export default function useBreakpointsTw() {
  const breakpointsTailwind = {
    sm: 640,
    md: 768,
    '2md': '800px',
    '3md': '840px',
    lg: 1024,
    xl: 1280,
    '2xl': 1466,
    '3xl': '1440px',
    '4xl': '1681px'
  }

  return useBreakpoints(breakpointsTailwind)
}
