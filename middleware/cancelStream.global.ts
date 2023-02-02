export default defineNuxtRouteMiddleware((to, from) => {
  const appStore = useAppStore()

  const isDifferentQuery =
    Object.entries(to.query).sort().toString() !==
    Object.entries(from.query).sort().toString()

  const isSameRouteDifferentQuery = to.name === from.name && isDifferentQuery

  if (!isSameRouteDifferentQuery) {
    appStore.cancelAllStreams()
  }
})
