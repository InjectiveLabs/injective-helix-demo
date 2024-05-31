import { defineStore } from 'pinia'
import { IS_MAINNET } from '@shared/utils/constant'
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
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected) {
        return
      }

      if (!IS_MAINNET) {
        return
      }

      const codes = await fetchNinjaPassCodes(walletStore.injectiveAddress)

      ninjaPassStore.$patch({
        codes: codes || []
      })
    }
  }
})
