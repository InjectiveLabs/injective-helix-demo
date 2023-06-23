import { defineStore } from 'pinia'
import { BalanceWithTokenWithErc20BalanceWithPrice } from '@injectivelabs/sdk-ui-ts'
import { awaitAll, BigNumberInBase } from '@injectivelabs/utils'
import type { Token, Erc20Token } from '@injectivelabs/token-metadata'
import { web3Client } from '@/app/Services'
import {
  setTokenAllowance,
  transfer,
  resetOrSetAllowance,
  withdraw
} from '@/store/peggy/message'

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
    resetOrSetAllowance,

    getErc20BalancesWithTokenAndPrice() {
      const tokenStore = useTokenStore()
      const peggyStore = usePeggyStore()
      const walletStore = useWalletStore()

      if (!walletStore.address || !walletStore.isUserWalletConnected) {
        return
      }

      const tradeableErc20Tokens = tokenStore.tradeableTokens.filter(
        (token) => token.erc20?.address
      )
      const tradeableBalancesWithTokenAndPrice = tradeableErc20Tokens.map(
        (token) =>
          ({
            token,
            denom: token.denom,
            balance: '0',
            erc20Balance: {
              balance: '0',
              allowance: '0'
            },
            usdPrice: 0
          } as BalanceWithTokenWithErc20BalanceWithPrice)
      )

      tokenStore.fetchTokensUsdPriceMap(
        tradeableBalancesWithTokenAndPrice.map(
          (balanceWithToken) => balanceWithToken.token.coinGeckoId
        )
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

      const erc20TokesAreFetched =
        peggyStore.tradeableErc20BalancesWithTokenAndPrice.length > 0

      if (!erc20TokesAreFetched) {
        peggyStore.getErc20BalancesWithTokenAndPrice()
      }

      const erc20TokenBalancesAreFetched =
        peggyStore.tradeableErc20BalancesWithTokenAndPrice.filter(
          (token) =>
            new BigNumberInBase(token.erc20Balance.balance).gt(0) ||
            new BigNumberInBase(token.erc20Balance.allowance).gt(0)
        )

      /**
       * We fetch the price of the first token
       * we show at the deposit form (INJ)
       * so we have to compare > 1
       */
      if (erc20TokenBalancesAreFetched.length > 1) {
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
    },

    async getErc20TokenBalanceAndAllowance(token: Token) {
      const peggyStore = usePeggyStore()
      const walletStore = useWalletStore()
      const tokenStore = useTokenStore()

      const { address, isUserWalletConnected } = walletStore

      if (!address || !isUserWalletConnected) {
        return
      }

      const balanceAndAllowance =
        await web3Client.fetchTokenBalanceAndAllowance({
          address,
          contractAddress: token.denom
        })
      const balanceWithToken = {
        token,
        denom: token.denom,
        balance: '0',
        erc20Balance: balanceAndAllowance,
        usdPrice: 0
      } as BalanceWithTokenWithErc20BalanceWithPrice

      const filteredErc20WithoutToken =
        peggyStore.tradeableErc20BalancesWithTokenAndPrice.filter(
          (t) => t.denom !== token.denom
        )

      peggyStore.$patch({
        tradeableErc20BalancesWithTokenAndPrice: [
          balanceWithToken,
          ...filteredErc20WithoutToken
        ]
      })

      await tokenStore.fetchTokensUsdPriceMap([
        balanceWithToken.token.coinGeckoId
      ])
    },

    async getErc20DenomBalanceAndAllowance(denom: string) {
      const peggyStore = usePeggyStore()
      const walletStore = useWalletStore()
      const tokenStore = useTokenStore()

      const { address, isUserWalletConnected } = walletStore

      if (!address || !isUserWalletConnected) {
        return
      }

      const token = tokenStore.tokens.find((token) => token.denom === denom)

      if (!token) {
        return
      }

      await peggyStore.getErc20TokenBalanceAndAllowance(token)
    }
  }
})
