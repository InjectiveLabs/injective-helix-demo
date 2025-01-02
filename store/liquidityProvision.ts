import { defineStore } from 'pinia'
import { mitoApi } from '@shared/Service'
import { MitoVault, MitoStakingPool } from '@injectivelabs/sdk-ts'
import { STAKING_CONTRACT_ADDRESS } from '@/app/utils/constants'

type LiquidityProvisionStoreState = {
  vaults: MitoVault[]
  stakingPools: MitoStakingPool[]
}

const initialStateFactory = (): LiquidityProvisionStoreState => ({
  vaults: [],
  stakingPools: []
})

export const useLiquidityProvisionStore = defineStore('liquidityProvision', {
  state: (): LiquidityProvisionStoreState => initialStateFactory(),

  actions: {
    async fetchMitoVaults() {
      const liquidityProvisionStore = useLiquidityProvisionStore()

      const { vaults } = await mitoApi.fetchVaults({})

      liquidityProvisionStore.$patch({
        vaults
      })
    },

    async fetchMitoStakingPools() {
      const liquidityProvisionStore = useLiquidityProvisionStore()

      const { pools } = await mitoApi.fetchStakingPools({
        stakingContractAddress: STAKING_CONTRACT_ADDRESS
      })

      liquidityProvisionStore.$patch({
        stakingPools: pools
      })
    },

    reset() {
      const liquidityProvisionStore = useLiquidityProvisionStore()

      const initialState = initialStateFactory()

      liquidityProvisionStore.$patch({
        ...initialState
      })
    }
  }
})
