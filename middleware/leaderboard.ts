import { IS_MAINNET, IS_STAGING } from '@/app/utils/constants'

export default defineNuxtRouteMiddleware((to) => {
  if (to.name === 'leaderboard' && IS_MAINNET && !IS_STAGING) {
    return navigateTo('/')
  }
})
