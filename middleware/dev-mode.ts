export default defineNuxtRouteMiddleware((to) => {
  if (to.query.devMode !== 'true') {
    return navigateTo('/')
  }
})
