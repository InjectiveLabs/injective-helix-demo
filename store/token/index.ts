import { defineStore } from 'pinia'
import {
  INJ_COIN_GECKO_ID,
  UiBankTransformer,
  BalanceWithTokenAndPrice,
  BalanceWithTokenWithErc20BalanceWithPrice
} from '@injectivelabs/sdk-ui-ts'
import { awaitAll, BigNumberInBase } from '@injectivelabs/utils'
import { Erc20Token, Token } from '@injectivelabs/token-metadata'
import { bankApi, tokenPrice, tokenService, web3Client } from '@/app/Services'
import { BTC_COIN_GECKO_ID } from '@/app/utils/constants'
import { setTokenAllowance, transfer, withdraw } from '@/store/token/message'
import { TokenUsdPriceMap } from '@/types'

type TokenStoreState = {
  tokens: Token[]
  btcUsdPrice: number
  injUsdPrice: number
  tokenUsdPriceMap: TokenUsdPriceMap
  tradeableErc20BalancesWithTokenAndPrice: BalanceWithTokenWithErc20BalanceWithPrice[]
}

const initialStateFactory = (): TokenStoreState => ({
  tokens: [],
  btcUsdPrice: 0,
  injUsdPrice: 0,
  tokenUsdPriceMap: {},
  tradeableErc20BalancesWithTokenAndPrice: []
})

export const useTokenStore = defineStore('token', {
  state: (): TokenStoreState => initialStateFactory(),
  getters: {
    tradeableTokens: (state) => {
      const derivativeStore = useDerivativeStore()
      const spotStore = useSpotStore()

      const tradeableDenoms = [
        ...new Set([
          ...derivativeStore.tradeableDenoms,
          ...spotStore.tradeableDenoms
        ])
      ]

      return state.tokens.filter((token) => {
        return tradeableDenoms.includes(token.denom)
      })
    }
  },
  actions: {
    transfer,
    withdraw,
    setTokenAllowance,

    async fetchErc20BalancesWithTokenAndPrice() {
      const tokenStore = useTokenStore()
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
            erc20: {
              balance: '0',
              allowance: '0'
            },
            usdPrice: await tokenPrice.fetchUsdTokenPrice(token.coinGeckoId)
          } as BalanceWithTokenWithErc20BalanceWithPrice
        }
      )

      tokenStore.$patch({
        tradeableErc20BalancesWithTokenAndPrice:
          tradeableBalancesWithTokenAndPrice
      })
    },

    async updateErc20BalancesWithTokenAndPrice() {
      const tokenStore = useTokenStore()
      const walletStore = useWalletStore()

      if (!walletStore.address || !walletStore.isUserWalletConnected) {
        return
      }

      const erc20TokenBalancesAreFetched =
        tokenStore.tradeableErc20BalancesWithTokenAndPrice.find(
          (token) =>
            new BigNumberInBase(token.erc20.balance).gt(0) ||
            new BigNumberInBase(token.erc20.allowance).gt(0)
        )

      if (erc20TokenBalancesAreFetched) {
        return
      }

      const updatedTradeableErc20BalancesWithTokenAndPrice = await awaitAll(
        tokenStore.tradeableErc20BalancesWithTokenAndPrice,
        async (token) => {
          const erc20Token = token.token as Erc20Token
          const tokenBalance = await web3Client.fetchTokenBalanceAndAllowance({
            address: walletStore.address,
            contractAddress: erc20Token.erc20.address
          })

          return {
            ...token,
            erc20: tokenBalance
          } as BalanceWithTokenAndPrice
        }
      )

      tokenStore.$patch({
        tradeableErc20BalancesWithTokenAndPrice:
          updatedTradeableErc20BalancesWithTokenAndPrice
      })
    },

    async fetchTokenUsdPriceMap(coinGeckoIdList: string[]) {
      const tokenStore = useTokenStore()

      const tokenUsdPriceList = await Promise.all(
        coinGeckoIdList.map(async (coinGeckoId) => ({
          [coinGeckoId]: await tokenPrice.fetchUsdTokenPrice(coinGeckoId)
        }))
      )

      const tokenUsdPriceMap = tokenUsdPriceList.reduce(
        (prices, tokenUsdPriceMap) => Object.assign(prices, tokenUsdPriceMap),
        {}
      )

      tokenStore.$patch({
        tokenUsdPriceMap
      })
    },

    async fetchInjUsdPrice() {
      const tokenStore = useTokenStore()

      tokenStore.$patch({
        injUsdPrice: await tokenPrice.fetchUsdTokenPrice(INJ_COIN_GECKO_ID)
      })
    },

    async fetchBitcoinUsdPrice() {
      const tokenStore = useTokenStore()

      tokenStore.$patch({
        btcUsdPrice: await tokenPrice.fetchUsdTokenPrice(BTC_COIN_GECKO_ID)
      })
    },

    async fetchSupplyTokenMeta() {
      const tokenStore = useTokenStore()

      const { supply } = await bankApi.fetchTotalSupply()

      const { bankSupply, ibcBankSupply } =
        UiBankTransformer.supplyToUiSupply(supply)

      const tokens = await tokenService.toCoinsWithToken([
        ...bankSupply,
        ...ibcBankSupply
      ])

      tokenStore.$patch({
        tokens
      })
    }
  }
})
