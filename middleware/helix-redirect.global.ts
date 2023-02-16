import { HELIX_APP_REDIRECTION } from '@/app/utils/constants'

export default defineNuxtRouteMiddleware((to) => {
  if (HELIX_APP_REDIRECTION && to.name !== 'helix') {
    return navigateTo('/helix')
  }
})
