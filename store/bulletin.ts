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

type BulletinStoreState = {
  vaults: MitoVault[]
  stakingPools: MitoStakingPool[]
  pool: Pool | undefined
  inflation: string | undefined
  injSupply: Coin | undefined
  mintParams: MintModuleParams | undefined
  annualProvisions: string | undefined
  distributionParams: DistributionModuleParams | undefined
}

const initialStateFactory = (): BulletinStoreState => ({
  vaults: [],
  stakingPools: [],
  inflation: undefined,
  annualProvisions: undefined,
  injSupply: undefined,
  pool: undefined,
  mintParams: undefined,
  distributionParams: undefined
})

export const useBulletinStore = defineStore('bulletin', {
  state: (): BulletinStoreState => initialStateFactory(),

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
      const bulletinStore = useBulletinStore()

      await bulletinStore.fetchInjSupply()
      await bulletinStore.fetchInflation()
      await bulletinStore.fetchAnnualProvisions()
      await bulletinStore.fetchDistributionParams()
      await bulletinStore.fetchMintParams()
      await bulletinStore.fetchPool()
    },

    async fetchInflation() {
      const bulletinStore = useBulletinStore()

      if (bulletinStore.inflation !== undefined) {
        return
      }

      const { inflation } = await mintApi.fetchInflation()

      bulletinStore.$patch({
        inflation
      })
    },

    async fetchInjSupply() {
      const bulletinStore = useBulletinStore()

      if (bulletinStore.injSupply !== undefined) {
        return
      }

      const { supply } = await tokenCacheApi.fetchTotalSupply()

      const injSupply = supply.find((coin) => coin.denom === injToken.denom)

      bulletinStore.$patch({
        injSupply: {
          amount: injSupply?.amount || '0',
          denom: injToken.denom
        }
      })
    },

    async fetchPool() {
      const bulletinStore = useBulletinStore()

      if (bulletinStore.pool !== undefined) {
        return
      }

      bulletinStore.$patch({
        pool: await stakingApi.fetchPool()
      })
    },

    async fetchAnnualProvisions() {
      const bulletinStore = useBulletinStore()

      if (bulletinStore.annualProvisions !== undefined) {
        return
      }

      const { annualProvisions } = await mintApi.fetchAnnualProvisions()

      bulletinStore.$patch({
        annualProvisions
      })
    },

    async fetchDistributionParams() {
      const bulletinStore = useBulletinStore()

      if (bulletinStore.distributionParams !== undefined) {
        return
      }

      bulletinStore.$patch({
        distributionParams: await distributionApi.fetchModuleParams()
      })
    },

    async fetchMintParams() {
      const bulletinStore = useBulletinStore()

      if (bulletinStore.mintParams !== undefined) {
        return
      }

      bulletinStore.$patch({
        mintParams: await mintApi.fetchModuleParams()
      })
    },

    async fetchMitoVaults() {
      const bulletinStore = useBulletinStore()

      const { vaults } = await mitoApi.fetchVaults({})

      bulletinStore.$patch({
        vaults
      })
    },

    async fetchMitoStakingPools() {
      const bulletinStore = useBulletinStore()

      const { pools } = await mitoApi.fetchStakingPools({
        stakingContractAddress: STAKING_CONTRACT_ADDRESS
      })

      bulletinStore.$patch({
        stakingPools: pools
      })
    },

    reset() {
      const bulletinStore = useBulletinStore()

      const initialState = initialStateFactory()

      bulletinStore.$patch({
        ...initialState
      })
    }
  }
})
