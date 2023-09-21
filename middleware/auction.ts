import { IS_MAINNET } from '@/app/utils/constants'

export default defineNuxtRouteMiddleware((to) => {
  if (to.query.showAuctions !== 'true' || IS_MAINNET) {
    return navigateTo('/')
  }
})
