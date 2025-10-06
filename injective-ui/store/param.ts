import { defineStore } from 'pinia'
import { injToken } from './../data/token'
import { sharedToBalanceInToken } from './../utils/formatter'
import { HttpClient, BigNumberInBase } from '@injectivelabs/utils'
import { getMintApi, getBankApi, getStakingApi } from './../Service'
import type {
  Pool,
  DistributionModuleParams,
  MinModuleParams as MintModuleParams
} from '@injectivelabs/sdk-ts'

const ON_CHAIN_BLOCK_TIME = 0.64
const ON_CHAIN_BLOCKS_PER_YEAR = 63072000
const ON_CHAIN_INFLATION = 0.88
const ON_CHAIN_COMMUNITY_TAX = 0.05

type ParamStoreState = {
  pool: Pool
  injSupply: string
  inflation: string
  blockTime: number
  bondedTokens: string
  communityTax: string
  blocksPerYear: string
  actualBlockTime: number
  actualBlocksPerYear: number
  mintParams: MintModuleParams
  distributionParams: DistributionModuleParams
}

const initialStateFactory = (): ParamStoreState => ({
  injSupply: '0',
  inflation: '0',
  bondedTokens: '0',
  communityTax: ON_CHAIN_COMMUNITY_TAX.toString(),
  mintParams: {} as MintModuleParams,

  blockTime: ON_CHAIN_BLOCK_TIME,
  blocksPerYear: ON_CHAIN_BLOCKS_PER_YEAR.toString(),
  actualBlockTime: 0,
  actualBlocksPerYear: 0,

  pool: {} as Pool,
  distributionParams: {} as DistributionModuleParams
})

export const useSharedParamStore = defineStore('sharedParam', {
  state: (): ParamStoreState => initialStateFactory(),
  getters: {
    /**
     * @deprecated - use `state.inflation` instead
     */
    baseInflation: (state) => new BigNumberInBase(state.inflation).toFixed(),

    apr: (state) => {
      const MAX_APR_DIFFERENCE = 0.25
      const secondsInAYear = new BigNumberInBase(365 * 24 * 60 * 60)

      const blockTime = secondsInAYear.div(state.blocksPerYear)
      const actualBlockTime = secondsInAYear.div(state.actualBlocksPerYear)

      const annualProvisionRatio = blockTime.div(state.blockTime)
      const actualAnnualProvisionRatio = actualBlockTime.div(
        state.actualBlockTime
      )

      const actualApr = new BigNumberInBase(state.actualBlocksPerYear)
        .dividedBy(state.blocksPerYear)
        .times(state.inflation)
        .times(state.injSupply)
        .times(new BigNumberInBase(1).minus(state.communityTax))
        .div(state.bondedTokens)
        .times(actualAnnualProvisionRatio)

      const apr = new BigNumberInBase(state.blocksPerYear)
        .dividedBy(state.blocksPerYear)
        .times(state.inflation)
        .times(state.injSupply)
        .times(new BigNumberInBase(1).minus(state.communityTax))
        .div(state.bondedTokens)
        .times(annualProvisionRatio)

      if (actualApr.isNaN() && apr.isNaN()) {
        return new BigNumberInBase(0)
      }

      // We cap it so there is no huge difference between on chain and actual apr on the UI
      const currentApr = actualApr.minus(apr).abs().gt(MAX_APR_DIFFERENCE)
        ? actualApr
        : apr

      return currentApr.isFinite() ? currentApr : new BigNumberInBase(0)
    }
  },
  actions: {
    async init() {
      await Promise.all([
        this.fetchSupply(),
        this.fetchInflation(),
        this.fetchPool(),
        this.fetchMintParams(),
        this.fetchChainParams()
      ])
    },

    async fetchSupply() {
      const bankApi = await getBankApi()
      const paramsStore = useSharedParamStore()

      const injSupply = await bankApi.fetchSupplyOf(injToken.denom)

      paramsStore.$patch({
        injSupply: sharedToBalanceInToken({ value: injSupply.amount })
      })
    },

    async fetchInflation() {
      const mintApi = await getMintApi()
      const paramsStore = useSharedParamStore()

      try {
        const { inflation } = await mintApi.fetchInflation()

        paramsStore.$patch({
          inflation: inflation.toFixed() || ON_CHAIN_INFLATION.toString()
        })
      } catch (e) {
        paramsStore.$patch({
          inflation: ON_CHAIN_INFLATION.toString()
        })
      }
    },

    async fetchPool() {
      const stakingApi = await getStakingApi()
      const paramsStore = useSharedParamStore()

      const pool = await stakingApi.fetchPool()

      paramsStore.$patch({
        pool,
        bondedTokens: pool.bondedTokens
      })
    },

    async fetchMintParams() {
      const mintApi = await getMintApi()
      const paramsStore = useSharedParamStore()

      const mintParams = await mintApi.fetchModuleParams()

      paramsStore.$patch({
        mintParams,
        blocksPerYear: mintParams.blocksPerYear
      })
    },

    async fetchChainParams() {
      const paramStore = useSharedParamStore()

      const httpClient = new HttpClient('https://chains.cosmos.directory/')

      try {
        const { data } = (await httpClient.get('injective')) as {
          data: {
            chain: {
              params: {
                actual_block_time: number
                actual_blocks_per_year: number
              }
            }
          }
        }

        paramStore.$patch({
          actualBlockTime: data.chain.params.actual_block_time,
          actualBlocksPerYear: data.chain.params.actual_blocks_per_year
        })
      } catch {
        // silently throw
        paramStore.$patch({
          actualBlockTime: ON_CHAIN_BLOCK_TIME,
          actualBlocksPerYear: ON_CHAIN_BLOCKS_PER_YEAR
        })
      }
    }
  }
})
