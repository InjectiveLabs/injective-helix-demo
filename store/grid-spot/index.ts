import {
  MsgExecuteContractCompat,
  MsgGrant,
  ExecArgCreateSpotGridStrategy
} from '@injectivelabs/sdk-ts'
import {
  chainGrpcAuthZApi,
  msgBroadcastClient,
  indexerGrpcTradingApi
} from '@/app/Services'
import { addSubacountIdToEthAddress } from '@/app/utils/helpers'
import { spotGridMarketsWithSubaccount } from '@/app/utils/constants/grid-spot-trading'
import { SpotGridMessages } from '@/types'

type GridSpotStore = {
  marketSlug: string
}

const initialStateFactory = (): GridSpotStore => ({ marketSlug: '' })

export const useGridStore = defineStore('grid-spot', {
  state: () => initialStateFactory(),
  actions: {
    async fetchGrants() {
      const walletStore = useWalletStore()
      const gridStore = useGridStore()

      if (!walletStore.injectiveAddress) {
        return
      }

      await chainGrpcAuthZApi.fetchGrants({
        params: {
          grantee: gridStore.smartContractAddressForGridMarket,
          granter: walletStore.injectiveAddress
        }
      })

      // console.log(response)

      // return response
    },

    async grantAuthorization() {
      const gridStore = useGridStore()
      const { address, injectiveAddress } = useWalletStore()

      if (!injectiveAddress) {
        return
      }

      const messageTypes = [
        SpotGridMessages.MsgBatchUpdateOrders,
        SpotGridMessages.MsgCreateSpotLimitOrder,
        SpotGridMessages.MsgWithdraw
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
          lowerBound: '10',
          upperBound: '10'
        })
      })

      await msgBroadcastClient.broadcastWithFeeDelegation({
        address,
        msgs: message
      })

      // console.log(response)
    },
    async fetchStrategies() {
      const gridStore = useGridStore()

      await indexerGrpcTradingApi.fetchGridStrategies({
        subaccountId: gridStore.subaccountIdForGridMarket
      })
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
