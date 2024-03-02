export default defineNuxtRouteMiddleware((to, from) => {
  // console.log('[MIDDLEWARD: ORDERBOOK]')
  const orderbookStore = useOrderbookStore()
  const appStore = useAppStore()

  orderbookStore.$reset()

  if (to.name !== from.name || to.params.slug !== from.params.slug) {
    appStore.marketsOpen = false
  }
})
