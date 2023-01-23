export default defineNuxtRouteMiddleware((to) => {
  const maintenanceEnabled = process.env.VITE_MAINTENANCE_ENABLED === 'true'

  if (to.name !== 'maintenance' && maintenanceEnabled) {
    return navigateTo('/maintenance')
  }

  if (to.name === 'maintenance' && !maintenanceEnabled) {
    return navigateTo('/')
  }
})
