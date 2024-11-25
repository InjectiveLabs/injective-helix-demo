import { LocalStorage } from '@injectivelabs/utils'
import { NETWORK } from '@/app/utils/constants'
import { localStorage } from '@/app/Services'

// Clear up old local storage keys
export default defineNuxtPlugin(() => {
  const MAX_LIMIT_OLD = 15
  const MAX_LIMIT = 10

  if (localStorage.has('storageCleaned')) {
    return
  }

  for (let i = 0; i <= MAX_LIMIT_OLD; i++) {
    const localStorageByIndex = new LocalStorage(
      `inj-dex-v${i}-${NETWORK}-${process.env.VITE_ENV || 'mainnet'}`
    )

    localStorageByIndex.clear()
  }

  for (let i = 0; i < MAX_LIMIT; i++) {
    const localStorageByIndex = new LocalStorage(`inj-helix-v${i}-${NETWORK}`)

    localStorageByIndex.clear()
  }

  localStorage.set('storageCleaned', 'true')
})
