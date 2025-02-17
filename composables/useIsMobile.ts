export default function useIsMobile() {
  const { lg } = useSharedBreakpoints()

  return computed(() => !lg.value)
}
