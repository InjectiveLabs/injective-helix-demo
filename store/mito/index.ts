import { mitoApi } from '@shared/Service'
import { MitoStakingPool, MitoVault } from '@injectivelabs/sdk-ts'
import { STAKING_CONTRACT_ADDRESS } from '@/app/utils/constants'

type MitoStoreState = {
  vaults: MitoVault[]
  stakingPools: MitoStakingPool[]
}

const initialStateFactory = (): MitoStoreState => ({
  vaults: [],
  stakingPools: []
})

export const useMitoStore = defineStore('mito', {
  state: (): MitoStoreState => initialStateFactory(),

  actions: {
    async fetchVaults() {
      const mitoStore = useMitoStore()

      const { vaults } = await mitoApi.fetchVaults({})

      mitoStore.$patch({
        vaults
      })
    },

    async fetchStakingPools() {
      const mitoStore = useMitoStore()

      const { pools } = await mitoApi.fetchStakingPools({
        stakingContractAddress: STAKING_CONTRACT_ADDRESS
      })

      mitoStore.$patch({
        stakingPools: pools
      })
    },

    reset() {
      const mitoStore = useMitoStore()

      const initialState = initialStateFactory()

      mitoStore.$patch({
        ...initialState
      })
    }
  }
})
