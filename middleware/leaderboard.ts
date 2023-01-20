import { IS_MAINNET } from '@/app/utils/constants'

export default defineNuxtRouteMiddleware((to) => {
  if (to.name === 'leaderboard' && IS_MAINNET) {
    return navigateTo('/')
  }
})
