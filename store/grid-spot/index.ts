import {
  // MsgExecuteContractCompat,
  MsgGrant
  // ExecArgCreateSpotGridStrategy
} from '@injectivelabs/sdk-ts'
import { TradingStrategy } from '@injectivelabs/indexer-proto-ts/esm/injective_trading_rpc'
import {
  chainGrpcAuthZApi,
  msgBroadcastClient
  // indexerGrpcTradingApi
} from '@/app/Services'
import { addSubacountIdToEthAddress } from '@/app/utils/helpers'
import { spotGridMarketsWithSubaccount } from '@/app/utils/constants/grid-spot-trading'
import { SpotGridMessages } from '@/types'

type GridSpotStore = {
  marketSlug: string
  strategies: TradingStrategy[]
}

const initialStateFactory = (): GridSpotStore => ({
  marketSlug: '',
  strategies: []
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

      const response = await chainGrpcAuthZApi.fetchGrants({
        params: {
          grantee: gridStore.smartContractAddressForGridMarket,
          granter: walletStore.injectiveAddress
        }
      })

      // console.log(response)

      return response
    },

    async grantAuthorization() {
      const gridStore = useGridStore()
      const { address, injectiveAddress } = useWalletStore()

      if (!injectiveAddress) {
        return
      }

      const messageTypes = [
        SpotGridMessages.MsgWithdraw,
        SpotGridMessages.MsgBatchUpdateOrders,
        SpotGridMessages.MsgCreateSpotLimitOrder
      ]

      const msgs = messageTypes.map((messageType) =>
        MsgGrant.fromJSON({
          messageType,
          grantee: gridStore.smartContractAddressForGridMarket,
          granter: injectiveAddress
        })
      )

      await msgBroadcastClient.broadcastWithFeeDelegation({
        address,
        msgs
      })

      // console.log(response)
    },

    async createStrategy() {
      // const gridStore = useGridStore()
      // const { injectiveAddress, address } = useWalletStore()
      // if (!injectiveAddress) {
      //   return
      // }
      // const message = MsgExecuteContractCompat.fromJSON({
      //   contractAddress: gridStore.smartContractAddressForGridMarket,
      //   sender: injectiveAddress,
      //   execArgs: ExecArgCreateSpotGridStrategy.fromJSON({
      //     subaccountId: gridStore.subaccountIdForGridMarket,
      //     levels: 10,
      //     lowerBound: '10',
      //     upperBound: '10'
      //   })
      // })
      // const response = await msgBroadcastClient.broadcastWithFeeDelegation({
      //   address,
      //   msgs: message
      // })
      // console.log(response)
    },

    async fetchStrategies() {
      // const gridStore = useGridStore()
      // const { strategies } = await indexerGrpcTradingApi.fetchGridStrategies({
      //   subaccountId: gridStore.subaccountIdForGridMarket,
      //   accountAddress: 'inj1zwzq3jrj7qltg9fhn73jsqhhtx7fwxz5e0swnx'
      // })
      // console.log(strategies)
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
