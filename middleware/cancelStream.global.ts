import { MainPage } from '@/types'

export default defineNuxtRouteMiddleware((to, from) => {
  const appStore = useAppStore()

  const isDifferentQuery =
    Object.entries(to.query).sort().toString() !==
    Object.entries(from.query).sort().toString()

  const isSameRouteDifferentQuery = to.name === from.name && isDifferentQuery
  const isActivityPage = (to.name as string).startsWith(MainPage.Activity)

  if (isSameRouteDifferentQuery || isActivityPage) {
    return
  }

  appStore.cancelAllStreams()
})
