import { defineStore } from 'pinia'
import {
  bankApi,
  mintApi,
  peggyApi,
  oracleApi,
  stakingApi,
  exchangeApi,
  governanceApi,
  distributionApi,
  insuranceFundsApi
} from '@shared/Service'
import {
  Pool,
  BankModuleParams,
  PeggyModuleParams,
  OracleModuleParams,
  StakingModuleParams,
  ExchangeModuleParams,
  GovModuleStateParams,
  InsuranceModuleParams,
  DistributionModuleParams,
  MinModuleParams as MintModuleParams
} from '@injectivelabs/sdk-ts'
import { injToken } from '@shared/data/token'
import { Coin } from '@injectivelabs/ts-types'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'

type ParamsStoreState = {
  inflation: string
  currentBlockTime: number
  annualProvisions: string
  injSupply: Coin
  pool: Pool
  mintParams: MintModuleParams
  stakingParams: StakingModuleParams
  insuranceParams: InsuranceModuleParams
  oracleParams: OracleModuleParams
  exchangeParams: ExchangeModuleParams
  bankParams: BankModuleParams
  peggyParams: PeggyModuleParams
  governanceParams: GovModuleStateParams
  distributionParams: DistributionModuleParams
}

const initialStateFactory = (): ParamsStoreState => ({
  inflation: '0',
  currentBlockTime: 0.9, // approximate, in seconds
  annualProvisions: '0',
  injSupply: {} as Coin,
  pool: {
    bondedTokens: '0',
    notBondedTokens: '0'
  },
  mintParams: {} as MintModuleParams,
  stakingParams: {} as StakingModuleParams,
  insuranceParams: {} as InsuranceModuleParams,
  oracleParams: {} as OracleModuleParams,
  exchangeParams: {} as ExchangeModuleParams,
  bankParams: {} as BankModuleParams,
  peggyParams: {} as PeggyModuleParams,
  governanceParams: {} as GovModuleStateParams,
  distributionParams: {} as DistributionModuleParams
})

export const useParamStore = defineStore('param', {
  state: (): ParamsStoreState => initialStateFactory(),
  getters: {
    apr: (state: ParamsStoreState) => {
      const inflation = new BigNumberInBase(state.inflation)
      const annualProvisions = new BigNumberInBase(state.annualProvisions)
      const bondedTokens = new BigNumberInBase(state.pool.bondedTokens)
      const secondsInAYear = new BigNumberInBase(365 * 24 * 60 * 60)
      const blockPerYear = new BigNumberInBase(state.mintParams.blocksPerYear)
      const blockTime = secondsInAYear.div(blockPerYear)
      const annualProvisionRatio = blockTime.div(state.currentBlockTime)
      const communityTax = new BigNumberInBase(
        state.distributionParams.communityTax
      )
      const totalInj = new BigNumberInWei(state.injSupply.amount).toBase()

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
      const paramStore = useParamStore()

      await paramStore.fetchInjSupply()
      await paramStore.fetchInflation()
      await paramStore.fetchAnnualProvisions()
      await paramStore.fetchDistributionParams()
      await paramStore.fetchMintParams()
      await paramStore.fetchPool()
    },

    async fetchInflation() {
      const paramStore = useParamStore()

      const { inflation } = await mintApi.fetchInflation()

      paramStore.$patch({
        inflation
      })
    },

    async fetchInjSupply() {
      const paramStore = useParamStore()
      const { supply } = await bankApi.fetchTotalSupply({ limit: 200 })
      const injSupply = supply.find((s) => s.denom === injToken.denom)!

      paramStore.$patch({
        injSupply
      })
    },

    async fetchPool() {
      const paramStore = useParamStore()

      paramStore.$patch({
        pool: await stakingApi.fetchPool()
      })
    },

    async fetchAnnualProvisions() {
      const paramStore = useParamStore()

      const { annualProvisions } = await mintApi.fetchAnnualProvisions()

      paramStore.$patch({
        annualProvisions
      })
    },

    async fetchDistributionParams() {
      const paramStore = useParamStore()

      paramStore.$patch({
        distributionParams: await distributionApi.fetchModuleParams()
      })
    },

    async fetchStakingParams() {
      const paramStore = useParamStore()

      paramStore.$patch({
        stakingParams: await stakingApi.fetchModuleParams()
      })
    },

    async fetchGovernanceParams() {
      const paramStore = useParamStore()

      paramStore.$patch({
        governanceParams: await governanceApi.fetchModuleParams()
      })
    },

    async fetchMintParams() {
      const paramStore = useParamStore()

      paramStore.$patch({
        mintParams: await mintApi.fetchModuleParams()
      })
    },

    async fetchInsuranceModuleParams() {
      const paramStore = useParamStore()

      paramStore.$patch({
        insuranceParams: await insuranceFundsApi.fetchModuleParams()
      })
    },

    async fetchParams() {
      const paramStore = useParamStore()

      const [
        mintParams,
        oracleParams,
        exchangeParams,
        bankParams,
        peggyParams,
        distributionParams
      ] = await Promise.all([
        mintApi.fetchModuleParams(),
        oracleApi.fetchModuleParams(),
        exchangeApi.fetchModuleParams(),
        bankApi.fetchModuleParams(),
        peggyApi.fetchModuleParams(),
        distributionApi.fetchModuleParams()
      ])

      paramStore.$patch({
        mintParams,
        oracleParams,
        exchangeParams,
        bankParams,
        peggyParams,
        distributionParams
      })
    }
  }
})
