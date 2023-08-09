import {
  ExecArgCreateSpotGridStrategy,
  MsgExecuteContractCompat,
  MsgGrant,
  spotQuantityToChainQuantityToFixed
} from '@injectivelabs/sdk-ts'
import { TradingStrategy } from '@injectivelabs/indexer-proto-ts/esm/injective_trading_rpc'
import {
  chainGrpcAuthZApi,
  msgBroadcastClient,
  indexerGrpcTradingApi
} from '@/app/Services'
import { addSubacountIdToEthAddress } from '@/app/utils/helpers'
import { spotGridMarketsWithSubaccount } from '@/app/utils/constants/grid-spot-trading'
import { SpotGridMessages } from '@/types'

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

      if (!walletStore.injectiveAddress) {
        return
      }

      const { grants } = await chainGrpcAuthZApi.fetchGrants({
        params: {
          grantee: gridStore.smartContractAddressForGridMarket,
          granter: walletStore.injectiveAddress
        }
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

      // console.log(response)
      return response
    },

    async createStrategy() {
      const gridStore = useGridStore()
      const { injectiveAddress, address } = useWalletStore()

      if (!injectiveAddress) {
        return
      }
      const message = MsgExecuteContractCompat.fromJSON({
        contractAddress: gridStore.smartContractAddressForGridMarket,
        sender: injectiveAddress,
        execArgs: ExecArgCreateSpotGridStrategy.fromJSON({
          subaccountId: gridStore.subaccountIdForGridMarket,
          levels: 10,
          lowerBound: '0.0000000000069',
          upperBound: '0.0000000000099'
        }),
        funds: {
          denom: 'peggy0x87aB3B4C8661e07D6372361211B96ed4Dc36B1B5',
          amount: spotQuantityToChainQuantityToFixed({
            value: 0.1,
            baseDecimals: 6
          })
        }
      })

      const response = await msgBroadcastClient.broadcastWithFeeDelegation({
        address,
        msgs: message
      })
      // console.log(response)
      return response
    },

    async fetchStrategies() {
      const gridStore = useGridStore()
      const { strategies } = await indexerGrpcTradingApi.fetchGridStrategies({
        subaccountId: gridStore.subaccountIdForGridMarket,
        accountAddress: 'inj1zwzq3jrj7qltg9fhn73jsqhhtx7fwxz5e0swnx'
      })
      // console.log(strategies)
      return strategies
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
    }
  }
})
