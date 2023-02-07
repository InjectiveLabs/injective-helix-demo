import { MAINTENANCE_ENABLED } from '@/app/utils/constants'

export default defineNuxtRouteMiddleware((to) => {
  if (to.name !== 'maintenance' && MAINTENANCE_ENABLED) {
    return navigateTo('/maintenance')
  }

  if (to.name === 'maintenance' && !MAINTENANCE_ENABLED) {
    return navigateTo('/')
  }
})
