import { breakpointsTailwind } from '@vueuse/core'

export default function useIsMobile() {
  const { lg } = useBreakpoints(breakpointsTailwind)

  return computed(() => !lg.value)
}
