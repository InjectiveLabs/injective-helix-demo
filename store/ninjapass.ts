import { defineStore } from 'pinia'
import { fetchNinjaPassCodes } from '@/app/services/ninjapass'

type Code = {
  address: string
  code: string
}

type NinjaPassStoreState = {
  codes?: Code[]
}

const initialStateFactory = (): NinjaPassStoreState => ({
  codes: []
})

export const useNinjaPassStore = defineStore('ninjaPass', {
  state: (): NinjaPassStoreState => initialStateFactory(),
  actions: {
    async fetchCodes() {
      const ninjaPassStore = useNinjaPassStore()
      const { injectiveAddress } = useWalletStore()

      if (!injectiveAddress) {
        return
      }

      const codes = (await fetchNinjaPassCodes(injectiveAddress)) || []

      ninjaPassStore.$patch({
        codes
      })
    }
  }
})
