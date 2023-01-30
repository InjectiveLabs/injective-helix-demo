export default defineNuxtRouteMiddleware((to, from) => {
  const appStore = useAppStore()

  const isSameRouteDifferentQuery =
    to.name === from.name &&
    JSON.stringify(to.query) !== JSON.stringify(from.query)

  if (!isSameRouteDifferentQuery) {
    appStore.cancelAllStreams()
  }
})
