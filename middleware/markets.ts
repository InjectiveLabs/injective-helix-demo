import { MARKETS_SLUGS, ROUTES } from '@/app/utils/constants'

export default defineNuxtRouteMiddleware((to) => {
  if (!ROUTES.spotMarketRouteNames.includes(to.name as string)) {
    return
  }

  const pairs = MARKETS_SLUGS.spotMarketRedirectsSlugsPairs
  const sources = Object.keys(pairs) as Array<keyof typeof pairs>

  for (const source of sources) {
    const destination = pairs[source as keyof typeof pairs]

    if (to.params.spot === source) {
      return navigateTo({
        name: 'spot-spot',
        params: {
          spot: destination
        }
      })
    }
  }
})
