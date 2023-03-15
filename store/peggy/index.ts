import { defineStore } from 'pinia'
import { BalanceWithTokenWithErc20BalanceWithPrice } from '@injectivelabs/sdk-ui-ts'
import { awaitAll, BigNumberInBase } from '@injectivelabs/utils'
import { Erc20Token } from '@injectivelabs/token-metadata'
import { tokenPrice, web3Client } from '@/app/Services'
import { setTokenAllowance, transfer, withdraw } from '@/store/peggy/message'

type TokenStoreState = {
  tradeableErc20BalancesWithTokenAndPrice: BalanceWithTokenWithErc20BalanceWithPrice[]
}

const initialStateFactory = (): TokenStoreState => ({
  tradeableErc20BalancesWithTokenAndPrice: []
})

export const usePeggyStore = defineStore('peggy', {
  state: (): TokenStoreState => initialStateFactory(),
  actions: {
    transfer,
    withdraw,
    setTokenAllowance,

    async fetchErc20BalancesWithTokenAndPrice() {
      const tokenStore = useTokenStore()
      const peggyStore = usePeggyStore()
      const walletStore = useWalletStore()

      if (!walletStore.address || !walletStore.isUserWalletConnected) {
        return
      }

      const tradeableErc20Tokens = tokenStore.tradeableTokens.filter(
        (token) => token.erc20?.address
      )
      const tradeableBalancesWithTokenAndPrice = await awaitAll(
        tradeableErc20Tokens,
        async (token) => {
          return {
            token,
            denom: token.denom,
            balance: '0',
            erc20Balance: {
              balance: '0',
              allowance: '0'
            },
            usdPrice: await tokenPrice.fetchUsdTokenPrice(token.coinGeckoId)
          } as BalanceWithTokenWithErc20BalanceWithPrice
        }
      )

      peggyStore.$patch({
        tradeableErc20BalancesWithTokenAndPrice:
          tradeableBalancesWithTokenAndPrice
      })
    },

    async updateErc20BalancesWithTokenAndPrice() {
      const peggyStore = usePeggyStore()
      const walletStore = useWalletStore()

      if (!walletStore.address || !walletStore.isUserWalletConnected) {
        return
      }

      const erc20TokenBalancesAreFetched =
        peggyStore.tradeableErc20BalancesWithTokenAndPrice.some(
          (token) =>
            new BigNumberInBase(token.erc20Balance.balance).gt(0) ||
            new BigNumberInBase(token.erc20Balance.allowance).gt(0)
        )

      if (erc20TokenBalancesAreFetched) {
        return
      }

      const updatedTradeableErc20BalancesWithTokenAndPrice = await awaitAll(
        peggyStore.tradeableErc20BalancesWithTokenAndPrice,
        async (balance) => {
          const erc20Token = balance.token as Erc20Token
          const tokenBalance = await web3Client.fetchTokenBalanceAndAllowance({
            address: walletStore.address,
            contractAddress: erc20Token.erc20.address
          })

          return {
            ...balance,
            erc20Balance: tokenBalance
          }
        }
      )

      peggyStore.$patch({
        tradeableErc20BalancesWithTokenAndPrice:
          updatedTradeableErc20BalancesWithTokenAndPrice
      })
    }
  }
})
