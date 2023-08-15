import {
  ExecArgCreateSpotGridStrategy,
  ExecArgRemoveGridStrategy,
  MsgExecuteContractCompat,
  MsgGrant,
  spotPriceToChainPriceToFixed,
  spotQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { TradingStrategy } from '@injectivelabs/indexer-proto-ts/esm/injective_trading_rpc'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import {
  chainGrpcAuthZApi,
  msgBroadcastClient,
  indexerGrpcTradingApi
} from '@/app/Services'
import { addSubacountIdToEthAddress } from '@/app/utils/helpers'
import { spotGridMarketsWithSubaccount } from '@/app/utils/constants/grid-spot-trading'
import { SpotGridMessages } from '@/types'
import { backupPromiseCall } from 'app/utils/async'

const messageTypes = [
  SpotGridMessages.MsgWithdraw,
  SpotGridMessages.MsgBatchUpdateOrders,
  SpotGridMessages.MsgCreateSpotMarketOrder
]

type GridSpotStore = {
  marketSlug: string
  strategies: TradingStrategy[]
  isAuthorized: boolean
}

const initialStateFactory = (): GridSpotStore => ({
  marketSlug: '',
  strategies: [],
  isAuthorized: false
})

export const useGridStore = defineStore('grid-spot', {
  state: () => initialStateFactory(),
  actions: {
    async fetchGrants() {
      const walletStore = useWalletStore()
      const gridStore = useGridStore()

      if (
        !walletStore.injectiveAddress ||
        !gridStore.smartContractAddressForGridMarket
      ) {
        return
      }

      const { grants } = await chainGrpcAuthZApi.fetchGrants({
        grantee: gridStore.smartContractAddressForGridMarket,
        granter: walletStore.injectiveAddress
      })

      if (!grants) {
        gridStore.$patch({ isAuthorized: false })
      }

      const isAuthorized = messageTypes.every((m) =>
        grants.map((g) => g.authorization).some((g) => g.endsWith(m))
      )

      gridStore.$patch({ isAuthorized })
    },

    async grantAuthorization() {
      const gridStore = useGridStore()
      const { address, injectiveAddress } = useWalletStore()

      if (!injectiveAddress) {
        return
      }

      const msgs = messageTypes.map((messageType) =>
        MsgGrant.fromJSON({
          messageType,
          grantee: gridStore.smartContractAddressForGridMarket,
          granter: injectiveAddress
        })
      )

      const response = await msgBroadcastClient.broadcastWithFeeDelegation({
        address,
        msgs
      })

      return response
    },

    async createStrategy({
      amount,
      levels,
      lowerBound,
      upperBound
    }: {
      levels: number
      lowerBound: string
      upperBound: string
      amount: string
    }) {
      const gridStore = useGridStore()
      const { injectiveAddress, address } = useWalletStore()

      if (!injectiveAddress || !gridStore.market) {
        return
      }

      const message = MsgExecuteContractCompat.fromJSON({
        contractAddress: gridStore.smartContractAddressForGridMarket,
        sender: injectiveAddress,
        execArgs: ExecArgCreateSpotGridStrategy.fromJSON({
          subaccountId: gridStore.subaccountIdForGridMarket,
          levels,
          lowerBound: spotPriceToChainPriceToFixed({
            value: lowerBound,
            baseDecimals: gridStore.market.baseToken.decimals,
            quoteDecimals: gridStore.market.quoteToken.decimals
          }),
          slippage: '0.2',
          upperBound: spotPriceToChainPriceToFixed({
            value: upperBound,
            baseDecimals: gridStore.market.baseToken.decimals,
            quoteDecimals: gridStore.market.quoteToken.decimals
          })
        }),
        funds: {
          denom: gridStore.market.quoteToken.denom,
          amount: spotQuantityToChainQuantityToFixed({
            value: amount,
            baseDecimals: gridStore.market.quoteToken.decimals
          })
        }
      })

      await msgBroadcastClient.broadcastWithFeeDelegation({
        address,
        msgs: message
      })

      backupPromiseCall(() => gridStore.fetchStrategies())
    },

    async removeStrategy() {
      const gridStore = useGridStore()
      const { injectiveAddress, address } = useWalletStore()

      if (!injectiveAddress) {
        return
      }

      const message = MsgExecuteContractCompat.fromJSON({
        contractAddress: gridStore.smartContractAddressForGridMarket,
        sender: injectiveAddress,
        execArgs: ExecArgRemoveGridStrategy.fromJSON({
          subaccountId: gridStore.subaccountIdForGridMarket
        })
      })

      await msgBroadcastClient.broadcastWithFeeDelegation({
        address,
        msgs: message
      })

      backupPromiseCall(() => gridStore.fetchStrategies())
    },

    async fetchStrategies() {
      const gridStore = useGridStore()
      const walletStore = useWalletStore()

      if (
        !walletStore.injectiveAddress ||
        !gridStore.subaccountIdForGridMarket
      ) {
        return
      }

      const { strategies } = await indexerGrpcTradingApi.fetchGridStrategies({
        subaccountId: gridStore.subaccountIdForGridMarket,
        accountAddress: walletStore.injectiveAddress
      })

      gridStore.$patch({ strategies })
    }
  },
  getters: {
    subaccountIdForGridMarket: (state) => {
      const walletStore = useWalletStore()

      const spotGridMarket = spotGridMarketsWithSubaccount.find(
        (m) => m.slug === state.marketSlug
      )

      if (!walletStore.address || !spotGridMarket) {
        return ''
      }

      return addSubacountIdToEthAddress(
        walletStore.address,
        spotGridMarket.subaccountId
      )
    },
    smartContractAddressForGridMarket: (state) => {
      const spotGridMarket = spotGridMarketsWithSubaccount.find(
        (m) => m.slug === state.marketSlug
      )
      if (!spotGridMarket) {
        return ''
      }

      return spotGridMarket.contractAddress
    },
    market: (state) => {
      const spotStore = useSpotStore()

      const market: UiSpotMarketWithToken | undefined = spotStore.markets.find(
        (market) => market.slug === state.marketSlug
      )

      return market
    },
    runningStrategies: (state) =>
      state.strategies.filter((strategy) => strategy.state === 'active'),
    removedStrategies: (state) =>
      state.strategies.filter((strategy) => strategy.state === 'removed')
  }
})
