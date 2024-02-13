export default defineNuxtRouteMiddleware((to) => {
  if (to.fullPath.includes('?') && !to.fullPath.includes('/?')) {
    const [path, query] = to.fullPath.split('?')
    const newPath = `${path}/?${query}`

    return navigateTo(newPath)
  }
})
