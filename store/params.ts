import { actionTree, getterTree, mutationTree } from 'typed-vuex'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { Coin } from '@injectivelabs/ts-types'
import { INJ_DENOM, Pool } from '@injectivelabs/sdk-ts'
import {
  MinModuleParams as MintModuleParams,
  StakingModuleParams,
  InsuranceModuleParams,
  ExchangeModuleParams,
  BankModuleParams,
  OracleModuleParams,
  PeggyModuleParams,
  GovModuleStateParams,
  DistributionModuleParams
} from '@injectivelabs/sdk-ts/dist/client'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import {
  bankApi,
  mintApi,
  stakingApi,
  distributionApi,
  governanceApi,
  insuranceApi,
  exchangeApi,
  oracleApi,
  peggyApi
} from '~/app/Services'

export const initialState = {
  inflation: '0',
  currentBlockTime: 2.63, // approximate, in seconds
  annualProvisions: '0',
  injSupply: {} as Coin,
  pool: {
    bondedTokens: '0',
    notBondedTokens: '0'
  } as Pool,
  mintParams: {} as MintModuleParams,
  stakingParams: {} as StakingModuleParams,
  insuranceParams: {} as InsuranceModuleParams,
  oracleParams: {} as OracleModuleParams,
  exchangeParams: {} as ExchangeModuleParams,
  bankParams: {} as BankModuleParams,
  peggyParams: {} as PeggyModuleParams,
  governanceParams: {} as GovModuleStateParams,
  distributionParams: {} as DistributionModuleParams
}

export const state = () => ({
  inflation: initialState.inflation as string,
  annualProvisions: initialState.annualProvisions as string,
  currentBlockTime: initialState.currentBlockTime as number,
  injSupply: initialState.injSupply as Coin,
  pool: initialState.pool as Pool,
  mintParams: initialState.mintParams as MintModuleParams,
  stakingParams: initialState.stakingParams as StakingModuleParams,
  insuranceParams: initialState.insuranceParams as InsuranceModuleParams,
  distributionParams:
    initialState.distributionParams as DistributionModuleParams,
  oracleParams: initialState.oracleParams as OracleModuleParams,
  exchangeParams: initialState.exchangeParams as ExchangeModuleParams,
  bankParams: initialState.bankParams as BankModuleParams,
  peggyParams: initialState.peggyParams as PeggyModuleParams,
  governanceParams: initialState.governanceParams as GovModuleStateParams
})

export type ParamsStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  apr: (state) => {
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
})

export const mutations = mutationTree(state, {
  setInflation(state: ParamsStoreState, inflation: string) {
    state.inflation = inflation
  },

  setAnnualProvisions(state: ParamsStoreState, annualProvisions: string) {
    state.annualProvisions = annualProvisions
  },

  setMintParams(state: ParamsStoreState, mintParams: MintModuleParams) {
    state.mintParams = mintParams
  },

  setStakingParams(
    state: ParamsStoreState,
    stakingParams: StakingModuleParams
  ) {
    state.stakingParams = stakingParams
  },

  setInjSupply(state: ParamsStoreState, injSupply: Coin) {
    state.injSupply = injSupply
  },

  setPool(state: ParamsStoreState, pool: Pool) {
    state.pool = pool
  },

  setInsuranceModuleParams(
    state: ParamsStoreState,
    insuranceParams: InsuranceModuleParams
  ) {
    state.insuranceParams = insuranceParams
  },

  setOracleParams(state: ParamsStoreState, oracleParams: OracleModuleParams) {
    state.oracleParams = oracleParams
  },

  setExchangeParams(
    state: ParamsStoreState,
    exchangeParams: ExchangeModuleParams
  ) {
    state.exchangeParams = exchangeParams
  },

  setBankParams(state: ParamsStoreState, bankParams: BankModuleParams) {
    state.bankParams = bankParams
  },

  setPeggyParams(state: ParamsStoreState, peggyParams: PeggyModuleParams) {
    state.peggyParams = peggyParams
  },

  setGovernanceParams(
    state: ParamsStoreState,
    governanceParams: GovModuleStateParams
  ) {
    state.governanceParams = governanceParams
  },

  setDistributionParams(
    state: ParamsStoreState,
    distributionParams: DistributionModuleParams
  ) {
    state.distributionParams = distributionParams
  }
})

export const actions = actionTree(
  { state, mutations },
  {
    async fetchAprParams(_) {
      await this.app.$accessor.params.fetchInjSupply()
      await this.app.$accessor.params.fetchInflation()
      await this.app.$accessor.params.fetchAnnualProvisions()
      await this.app.$accessor.params.fetchDistributionParams()
      await this.app.$accessor.params.fetchMintParams()
      await this.app.$accessor.params.fetchPool()
    },

    async fetchInflation({ commit }) {
      const { inflation } = await mintApi.fetchInflation()

      commit('setInflation', inflation)
    },

    async fetchInjSupply({ commit }) {
      const { supply } = await bankApi.fetchTotalSupply()
      const injSupply = supply.find((s) => s.denom === INJ_DENOM)!

      commit('setInjSupply', injSupply)
    },

    async fetchPool({ commit }) {
      const pool = await stakingApi.fetchPool()

      commit('setPool', pool)
    },

    async fetchAnnualProvisions({ commit }) {
      const { annualProvisions } = await mintApi.fetchAnnualProvisions()

      commit('setAnnualProvisions', annualProvisions)
    },

    async fetchDistributionParams({ commit }) {
      const params = await distributionApi.fetchModuleParams()

      commit('setDistributionParams', params)
    },

    async fetchStakingParams({ commit }) {
      const params = await stakingApi.fetchModuleParams()

      commit('setStakingParams', params)
    },

    async fetchGovernanceParams({ commit }) {
      const params = await governanceApi.fetchModuleParams()

      commit('setGovernanceParams', params)
    },

    async fetchMintParams({ commit }) {
      const params = await mintApi.fetchModuleParams()

      commit('setMintParams', params)
    },

    async fetchInsuranceModuleParams({ commit }) {
      const params = await insuranceApi.fetchModuleParams()

      commit('setInsuranceModuleParams', params)
    },

    async fetchParams({ commit }) {
      commit('setMintParams', await mintApi.fetchModuleParams())
      commit('setOracleParams', await oracleApi.fetchModuleParams())
      commit('setExchangeParams', await exchangeApi.fetchModuleParams())
      commit('setBankParams', await bankApi.fetchModuleParams())
      commit('setPeggyParams', await peggyApi.fetchModuleParams())
      commit('setDistributionParams', await distributionApi.fetchModuleParams())
    }
  }
)
