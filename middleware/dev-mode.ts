export default defineNuxtRouteMiddleware((to) => {
  const appStore = useAppStore()

  if (to.query.devMode === 'true') {
    appStore.$patch({ devMode: true })
  }

  if (!appStore.devMode) {
    return navigateTo('/')
  }
})
