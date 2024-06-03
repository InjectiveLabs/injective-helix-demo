import { defineStore } from 'pinia'
import {
  Pool,
  MitoVault,
  MitoStakingPool,
  DistributionModuleParams,
  MinModuleParams as MintModuleParams
} from '@injectivelabs/sdk-ts'
import { injToken } from '@shared/data/token'
import { Coin } from '@injectivelabs/ts-types'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import {
  mitoApi,
  mintApi,
  stakingApi,
  tokenCacheApi,
  distributionApi
} from '@shared/Service'
import { STAKING_CONTRACT_ADDRESS } from '@/app/utils/constants'

const CURRENT_BLOCK_TIME = 0.9

type LiquidityProvisionStoreState = {
  vaults: MitoVault[]
  stakingPools: MitoStakingPool[]
  pool: Pool | undefined
  inflation: string | undefined
  injSupply: Coin | undefined
  mintParams: MintModuleParams | undefined
  annualProvisions: string | undefined
  distributionParams: DistributionModuleParams | undefined
}

const initialStateFactory = (): LiquidityProvisionStoreState => ({
  vaults: [],
  stakingPools: [],
  inflation: undefined,
  annualProvisions: undefined,
  injSupply: undefined,
  pool: undefined,
  mintParams: undefined,
  distributionParams: undefined
})

export const useLiquidityProvisionStore = defineStore('liquidityProvision', {
  state: (): LiquidityProvisionStoreState => initialStateFactory(),

  getters: {
    apr: (state) => {
      const inflation = new BigNumberInBase(state?.inflation || '0')
      const annualProvisions = new BigNumberInBase(
        state?.annualProvisions || '0'
      )
      const bondedTokens = new BigNumberInBase(state.pool?.bondedTokens || '0')
      const secondsInAYear = new BigNumberInBase(365 * 24 * 60 * 60)
      const blockPerYear = new BigNumberInBase(
        state.mintParams?.blocksPerYear || 35040000
      )
      const blockTime = secondsInAYear.div(blockPerYear)
      const annualProvisionRatio = blockTime.div(CURRENT_BLOCK_TIME)
      const communityTax = new BigNumberInBase(
        state.distributionParams?.communityTax || 0.05
      )
      const totalInj = new BigNumberInWei(
        state.injSupply?.amount || '0'
      ).toBase()

      if (inflation.lte(0) || annualProvisions.lte(0)) {
        return ZERO_IN_BASE
      }

      if (totalInj.lte(0) || bondedTokens.lte(0)) {
        return ZERO_IN_BASE
      }

      const bondedTokensRatio = bondedTokens.div(totalInj)
      const nominalApr = inflation
        .multipliedBy(new BigNumberInBase(1).minus(communityTax))
        .dividedBy(bondedTokensRatio)

      return nominalApr.times(annualProvisionRatio)
    }
  },

  actions: {
    async fetchAprParams() {
      const liquidityProvisionStore = useLiquidityProvisionStore()

      await liquidityProvisionStore.fetchInjSupply()
      await liquidityProvisionStore.fetchInflation()
      await liquidityProvisionStore.fetchAnnualProvisions()
      await liquidityProvisionStore.fetchDistributionParams()
      await liquidityProvisionStore.fetchMintParams()
      await liquidityProvisionStore.fetchPool()
    },

    async fetchInflation() {
      const liquidityProvisionStore = useLiquidityProvisionStore()

      if (liquidityProvisionStore.inflation !== undefined) {
        return
      }

      const { inflation } = await mintApi.fetchInflation()

      liquidityProvisionStore.$patch({
        inflation
      })
    },

    async fetchInjSupply() {
      const liquidityProvisionStore = useLiquidityProvisionStore()

      if (liquidityProvisionStore.injSupply !== undefined) {
        return
      }

      const { supply } = await tokenCacheApi.fetchTotalSupply()

      const injSupply = supply.find((coin) => coin.denom === injToken.denom)

      liquidityProvisionStore.$patch({
        injSupply: {
          amount: injSupply?.amount || '0',
          denom: injToken.denom
        }
      })
    },

    async fetchPool() {
      const liquidityProvisionStore = useLiquidityProvisionStore()

      if (liquidityProvisionStore.pool !== undefined) {
        return
      }

      liquidityProvisionStore.$patch({
        pool: await stakingApi.fetchPool()
      })
    },

    async fetchAnnualProvisions() {
      const liquidityProvisionStore = useLiquidityProvisionStore()

      if (liquidityProvisionStore.annualProvisions !== undefined) {
        return
      }

      const { annualProvisions } = await mintApi.fetchAnnualProvisions()

      liquidityProvisionStore.$patch({
        annualProvisions
      })
    },

    async fetchDistributionParams() {
      const liquidityProvisionStore = useLiquidityProvisionStore()

      if (liquidityProvisionStore.distributionParams !== undefined) {
        return
      }

      liquidityProvisionStore.$patch({
        distributionParams: await distributionApi.fetchModuleParams()
      })
    },

    async fetchMintParams() {
      const liquidityProvisionStore = useLiquidityProvisionStore()

      if (liquidityProvisionStore.mintParams !== undefined) {
        return
      }

      liquidityProvisionStore.$patch({
        mintParams: await mintApi.fetchModuleParams()
      })
    },

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
