export default defineNuxtRouteMiddleware(() => {
  // console.log('[MIDDLEWARD: ORDERBOOK]')
  const orderbookStore = useOrderbookStore()
  orderbookStore.$reset()
})
