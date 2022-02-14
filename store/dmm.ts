import { actionTree } from 'typed-vuex'
import {
  EpochResultRecord,
  LCSResultRecord,
  VCSResultRecord
} from '@injectivelabs/exchange-consumer'
import { TokenTransformer } from '@injectivelabs/ui-common'
import {
  UiDmmMarketMaker,
  UiEpochMarkets,
  UiEpochMarketsWithToken,
  UiEpochDate,
  UiEpochMeta,
  findActiveMarket
} from '~/app/services/dmm'
import { dmmService, tokenService } from '~/app/Services'

const initialStateFactory = () => ({
  activeEpochId: '' as string,
  activeMarketId: '' as string,
  epochUsdPrice: 0 as number,
  updatedAt: '' as string,
  dates: [] as UiEpochDate[],
  marketMakers: [] as UiDmmMarketMaker[],
  markets: [] as UiEpochMarkets[],
  marketsWithToken: [] as UiEpochMarketsWithToken[],
  meta: {} as UiEpochMeta,
  lcs: {} as LCSResultRecord,
  vcs: {} as VCSResultRecord,
  records: [] as EpochResultRecord[]
})

const initialState = initialStateFactory()

export const state = () => ({
  activeEpochId: initialState.activeEpochId as string,
  activeMarketId: initialState.activeMarketId as string,
  epochUsdPrice: initialState.epochUsdPrice as number,
  updatedAt: initialState.updatedAt as string,
  dates: initialState.dates as UiEpochDate[],
  marketMakers: initialState.marketMakers as UiDmmMarketMaker[],
  markets: initialState.markets as UiEpochMarkets[],
  marketsWithToken: initialState.marketsWithToken as UiEpochMarketsWithToken[],
  meta: initialState.meta as UiEpochMeta,
  lcs: initialState.lcs as LCSResultRecord,
  vcs: initialState.vcs as VCSResultRecord,
  records: initialState.records as EpochResultRecord[]
})

export type DMMStoreState = ReturnType<typeof state>

export const mutations = {
  setActiveEpochId(state: DMMStoreState, epochId: string) {
    state.activeEpochId = epochId
  },

  setActiveMarketId(state: DMMStoreState, marketId: string) {
    state.activeMarketId = marketId
  },

  setEpochUsdPrice(state: DMMStoreState, price: number) {
    state.epochUsdPrice = price
  },

  setUpdatedAt(state: DMMStoreState, updatedAt: string) {
    state.updatedAt = updatedAt
  },

  setDates(state: DMMStoreState, dates: UiEpochDate[]) {
    state.dates = dates
  },

  setMarketMakers(state: DMMStoreState, marketMakers: UiDmmMarketMaker[]) {
    state.marketMakers = marketMakers
  },

  setMeta(state: DMMStoreState, meta: UiEpochMeta) {
    state.meta = meta
  },

  setMarkets(state: DMMStoreState, markets: UiEpochMarkets[]) {
    state.markets = markets
  },

  setMarketsWithToken(
    state: DMMStoreState,
    marketsWithToken: UiEpochMarketsWithToken[]
  ) {
    state.marketsWithToken = marketsWithToken
  },

  setLcs(state: DMMStoreState, lcs: LCSResultRecord) {
    state.lcs = lcs
  },

  setVcs(state: DMMStoreState, vcs: VCSResultRecord) {
    state.vcs = vcs
  },

  setRecords(state: DMMStoreState, records: EpochResultRecord[]) {
    state.records = records
  },

  reset(state: DMMStoreState) {
    const initialState = initialStateFactory()

    state.activeEpochId = initialState.activeEpochId
    state.activeMarketId = initialState.activeMarketId
    state.epochUsdPrice = initialState.epochUsdPrice
    state.updatedAt = initialState.updatedAt
    state.dates = initialState.dates
    state.meta = initialState.meta
    state.marketMakers = initialState.marketMakers
    state.markets = initialState.markets
    state.marketsWithToken = initialState.marketsWithToken
    state.lcs = initialState.lcs
    state.vcs = initialState.vcs
    state.records = initialState.records
  }
}

export const actions = actionTree(
  { state },
  {
    async fetchDMMRecords(
      { commit },
      {
        accountAddress,
        dmmName
      }: {
        accountAddress?: string
        dmmName?: string
      }
    ) {
      const { activeEpochId } = this.app.$accessor.dmm
      const records = await dmmService.fetchDMMRecords({
        accountAddress,
        dmmName,
        epochId: activeEpochId
      })

      if (records) {
        commit('setRecords', records)
      }
    },

    async fetchEpochs({ commit }) {
      const epochDates = await dmmService.fetchEpochs()

      commit('setDates', epochDates)
    },

    async fetchEpochSummary({ commit }, epochId?: string) {
      const { meta, result } = await dmmService.fetchEpochSummary({ epochId })

      commit('setActiveEpochId', meta.meta.id)
      commit('setMarkets', meta.markets)
      commit('setMeta', meta.meta)
      commit('setMarketMakers', meta.marketMakers)
      commit('setLcs', result.lcs)
      commit('setVcs', result.vcs)
      commit('setUpdatedAt', result.createdAt)

      const baseMarkets = await dmmService.fetchMarkets(meta.markets)
      const marketsWithToken = baseMarkets
        .map((market) => {
          const [baseTokenSymbol] = market.ticker.split('/')
          const baseToken = TokenTransformer.tokenMetaToToken(
            tokenService.getTokenMetaDataBySymbol(baseTokenSymbol),
            baseTokenSymbol
          )

          return {
            ...market,
            token: baseToken
          }
        })
        .filter(
          (market) => market.token !== undefined
        ) as UiEpochMarketsWithToken[]

      commit('setMarketsWithToken', marketsWithToken)
      commit('setActiveMarketId', findActiveMarket(marketsWithToken))
      commit(
        'setEpochUsdPrice',
        await dmmService.fetchEpochUsdPrice(meta.meta as UiEpochMeta)
      )
    }
  }
)
