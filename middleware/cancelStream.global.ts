export default defineNuxtRouteMiddleware(() => {
  const appStore = useAppStore()

  appStore.cancelAllStreams()
})
