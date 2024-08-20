import { MAINTENANCE_ENABLED } from '@/app/utils/constants'
import { MainPage } from '@/types'

export default defineNuxtRouteMiddleware((to) => {
  if (to.name !== MainPage.Maintenance && MAINTENANCE_ENABLED) {
    return navigateTo({ name: MainPage.Maintenance })
  }

  if (to.name === MainPage.Maintenance && !MAINTENANCE_ENABLED) {
    return navigateTo({ name: MainPage.Index })
  }
})
