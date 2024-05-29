export default defineNuxtRouteMiddleware((to, from) => {
  const appStore = useAppStore()

  if (to.name !== from.name || to.params.slug !== from.params.slug) {
    appStore.marketsOpen = false
  }
})
