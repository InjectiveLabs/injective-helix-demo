export default defineNuxtRouteMiddleware((to, from) => {
  const appStore = useAppStore()

  // don't cancel stream for route query change
  if (to.name !== from.name) {
    appStore.cancelAllStreams()
  }
})
