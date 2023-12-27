import { defineStore } from 'pinia'
import {
  CosmosChannel,
  BalanceWithTokenWithIbcBalance
} from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import { CosmosChainId } from '@injectivelabs/ts-types'
import { deposit, withdraw } from '@/store/ibc/message'
import {
  validateCosmosWallet,
  getAccountsFromCosmosWallet,
  fetchBalancesWithTokenFromChainId,
  fetchTokensFromChainId
} from '@/app/services/cosmos'
import { COSMOS_CHANNEL } from '@/app/data/bridge'

type IbcStoreState = {
  cosmosAddress: string
  channel?: CosmosChannel
  balancesWithToken: BalanceWithTokenWithIbcBalance[]
  ibcTokens: Token[]
}

const initialStateFactory = (): IbcStoreState => ({
  cosmosAddress: '',
  channel: undefined,
  balancesWithToken: [],
  ibcTokens: []
})

export const useIbcStore = defineStore('ibc', {
  state: (): IbcStoreState => initialStateFactory(),
  getters: {
    tokensToBalancesWithToken: (state) => {
      return state.ibcTokens.map((token) => ({
        token,
        balance: '0',
        denom: token.denom
      }))
    }
  },
  actions: {
    deposit,
    withdraw,

    async connect(chainId: string) {
      const ibcStore = useIbcStore()
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected || !walletStore.isCosmosWallet) {
        return
      }

      const [cosmosAddress] = await getAccountsFromCosmosWallet(
        chainId as CosmosChainId,
        walletStore.wallet
      )

      ibcStore.$patch({
        cosmosAddress,
        channel: {
          ...COSMOS_CHANNEL.find(({ aChainId }) => aChainId === chainId)
        }
      })

      await ibcStore.fetchTokens()
    },

    async connectWithBalances(chainId: string) {
      const ibcStore = useIbcStore()

      await ibcStore.connect(chainId)
      await ibcStore.fetchBalances()
    },

    async validate() {
      const ibcStore = useIbcStore()
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected || !walletStore.isCosmosWallet) {
        return
      }

      if (!ibcStore.cosmosAddress || !ibcStore.channel) {
        return
      }

      await validateCosmosWallet({
        address: ibcStore.cosmosAddress,
        chainId: ibcStore.channel.aChainId as CosmosChainId,
        wallet: walletStore.wallet
      })
    },

    async fetchTokens() {
      const ibcStore = useIbcStore()
      const tokenStore = useTokenStore()

      const { channel, cosmosAddress } = ibcStore

      if (!channel || !cosmosAddress) {
        return
      }

      const tokens = fetchTokensFromChainId(channel)

      ibcStore.$patch({
        ibcTokens: tokens
      })

      await tokenStore.getTokensUsdPriceMapFromToken(tokens)
    },

    async fetchBalances() {
      const ibcStore = useIbcStore()

      const { channel, cosmosAddress } = ibcStore

      if (!channel || !cosmosAddress) {
        return
      }

      const balancesWithToken = await fetchBalancesWithTokenFromChainId(
        cosmosAddress,
        channel
      )

      ibcStore.$patch({
        balancesWithToken
      })
    },

    reset() {
      useIbcStore().$reset()
    }
  }
})
