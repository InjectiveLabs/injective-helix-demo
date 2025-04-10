import { MAINTENANCE_DISABLED } from '@shared/utils/constant'
import { MainPage } from '@/types'

export default defineNuxtRouteMiddleware((to) => {
  const jsonStore = useSharedJsonStore()

  const isMaintenanceMode = !MAINTENANCE_DISABLED && jsonStore.isMaintenanceMode

  if (to.name !== MainPage.Maintenance && isMaintenanceMode) {
    return navigateTo({ name: MainPage.Maintenance })
  }

  if (to.name === MainPage.Maintenance && !isMaintenanceMode) {
    return navigateTo({ name: MainPage.Index })
  }
})
