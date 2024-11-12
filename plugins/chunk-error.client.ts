import { IS_PRODUCTION } from '@/app/utils/constants'

export default defineNuxtPlugin((context) => {
  const router = useRouter()

  if (!IS_PRODUCTION) {
    return
  }

  router.onError((error) => {
    if (error.message.includes('Failed to fetch dynamically imported module')) {
      window.location.reload()
    }

    if (error.message.includes('Importing a module script failed')) {
      window.location.reload()
    }
  })

  context.hook('app:chunkError', () => {
    window.location.reload()
  })

  context.hook('app:error', (error) => {
    if (error.message.includes('Loading chunk')) {
      window.location.reload()
    }
  })
})
