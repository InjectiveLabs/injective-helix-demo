import { defineStore } from 'pinia'
import {
  TokenWithBalance,
  TokenWithBalanceAndPrice,
  UNLIMITED_ALLOWANCE,
  INJ_COIN_GECKO_ID,
  BankBalanceWithToken
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { getEthereumAddress, MsgSendToEth } from '@injectivelabs/sdk-ts'
import { Erc20Token, Token } from '@injectivelabs/token-metadata'
import {
  msgBroadcastClient,
  tokenPrice,
  tokenService,
  web3Broadcaster,
  web3Client,
  web3Composer
} from '@/app/Services'
import { BTC_COIN_GECKO_ID } from '@/app/utils/constants'
import { backupPromiseCall } from '@/app/utils/async'
import { TokenUsdPriceMap } from '@/types'

type TokenStoreState = {
  erc20TokensWithBalanceAndPriceFromBank: TokenWithBalanceAndPrice[]
  ibcTokensWithBalanceAndPriceFromBank: TokenWithBalanceAndPrice[]
  tokenUsdPriceMap: TokenUsdPriceMap
  btcUsdPrice: number
  injUsdPrice: number
}
const initialStateFactory = (): TokenStoreState => ({
  erc20TokensWithBalanceAndPriceFromBank: [] as TokenWithBalanceAndPrice[],
  ibcTokensWithBalanceAndPriceFromBank: [] as TokenWithBalanceAndPrice[],
  tokenUsdPriceMap: {} as TokenUsdPriceMap,
  btcUsdPrice: 0 as number,
  injUsdPrice: 0 as number
})

export const useTokenStore = defineStore('token', {
  state: (): TokenStoreState => initialStateFactory(),
  actions: {
    async getErc20TokensWithBalanceAndPriceFromBankAndMarkets() {
      const tokenStore = useTokenStore()

      const { markets: derivativeMarkets } = useDerivativeStore()
      const { markets: spotMarkets } = useSpotStore()
      const { address, isUserWalletConnected } = useWalletStore()

      if (!address || !isUserWalletConnected) {
        return
      }

      const { bankErc20BalancesWithToken, bankIbcBalancesWithToken } =
        useBankStore()

      const tokenToTokenWithBalanceAndAllowance = async ({
        token
      }: BankBalanceWithToken) => {
        const erc20Token = token as Erc20Token
        const balance = await web3Client.fetchTokenBalanceAndAllowance({
          address,
          contractAddress: erc20Token.address
        })

        return {
          ...token,
          ...balance,
          usdPrice: await tokenPrice.fetchUsdTokenPrice(token.coinGeckoId)
        } as TokenWithBalanceAndPrice
      }

      const ercTokensWithBalanceAndAllowance = await Promise.all(
        bankErc20BalancesWithToken.map(tokenToTokenWithBalanceAndAllowance)
      )

      const ibcTokensWithBalanceAndPriceFromBank = await Promise.all(
        bankIbcBalancesWithToken.map(tokenToTokenWithBalanceAndAllowance)
      )

      const denomsInBankBalances = [
        ...ercTokensWithBalanceAndAllowance,
        ...ibcTokensWithBalanceAndPriceFromBank
      ].map((balance) => balance.denom)
      const spotBaseDenomsNotInBankBalances = spotMarkets
        .filter((market) => {
          return !denomsInBankBalances.includes(market.baseDenom)
        })
        .map((market) => market.baseDenom)
      const spotQuoteDenomsNotInBankBalances = spotMarkets
        .filter((market) => {
          return !denomsInBankBalances.includes(market.quoteDenom)
        })
        .map((market) => market.quoteDenom)
      const derivativeQuoteDenomsNotInBankBalances = derivativeMarkets
        .filter((market) => {
          return !denomsInBankBalances.includes(market.quoteDenom)
        })
        .map((market) => market.quoteDenom)
      const denomsNotInBankBalances = [
        ...spotBaseDenomsNotInBankBalances,
        ...spotQuoteDenomsNotInBankBalances,
        ...derivativeQuoteDenomsNotInBankBalances
      ]
      const uniqueDenomsNotInBankBalances = [
        ...new Set(denomsNotInBankBalances)
      ]
      const tradeableTokensWithBalanceAndPrice = await Promise.all(
        uniqueDenomsNotInBankBalances.map(async (denom) => {
          const token = await tokenService.getDenomToken(denom)
          const erc20Token = token as Erc20Token

          const tokenBalance = await web3Client.fetchTokenBalanceAndAllowance({
            address,
            contractAddress: erc20Token.address
          })

          return {
            ...token,
            ...tokenBalance,
            usdPrice: await tokenPrice.fetchUsdTokenPrice(token.coinGeckoId)
          } as TokenWithBalanceAndPrice
        })
      )

      const ercTokensWithBalanceAndAllowanceWithTradeableTokens = [
        ...new Map(
          [
            ...tradeableTokensWithBalanceAndPrice,
            ...ercTokensWithBalanceAndAllowance
          ].map((token) => [token.denom, token])
        ).values()
      ].filter(({ address }) => address)

      tokenStore.$patch({
        ibcTokensWithBalanceAndPriceFromBank,
        erc20TokensWithBalanceAndPriceFromBank:
          ercTokensWithBalanceAndAllowanceWithTradeableTokens
      })
    },

    async getTokenUsdPriceMap(coinGeckoIdList: string[]) {
      const tokenStore = useTokenStore()

      const tokenUsdPriceList = await Promise.all(
        coinGeckoIdList.map(async (coinGeckoId) => ({
          [coinGeckoId]: await tokenPrice.fetchUsdTokenPrice(coinGeckoId)
        }))
      )

      const tokenUsdPriceMap = tokenUsdPriceList.reduce(
        (list, tokenUsdPriceMap) => Object.assign(list, tokenUsdPriceMap),
        {}
      )

      tokenStore.$patch({
        tokenUsdPriceMap
      })
    },

    async getInjUsdPrice() {
      const tokenStore = useTokenStore()

      tokenStore.$patch({
        injUsdPrice: await tokenPrice.fetchUsdTokenPrice(INJ_COIN_GECKO_ID)
      })
    },

    async getBitcoinUsdPrice() {
      const tokenStore = useTokenStore()

      tokenStore.$patch({
        btcUsdPrice: await tokenPrice.fetchUsdTokenPrice(BTC_COIN_GECKO_ID)
      })
    },

    async setTokenAllowance(tokenWithBalance: TokenWithBalance) {
      const tokenStore = useTokenStore()

      const { address, validate } = useWalletStore()
      const { gasPrice, fetchGasPrice, queue } = useAppStore()

      const tokenAddress = tokenWithBalance.address as keyof Erc20Token

      await queue()
      await fetchGasPrice()
      await validate()

      const tx = await web3Composer.getSetTokenAllowanceTx({
        address,
        gasPrice,
        tokenAddress,
        amount: UNLIMITED_ALLOWANCE.toFixed()
      })

      await web3Broadcaster.sendTransaction({
        tx,
        address
      })

      const token = tokenStore.erc20TokensWithBalanceAndPriceFromBank.find(
        (token) => {
          const erc20Token = token as Erc20Token

          return erc20Token.address.toLowerCase() === tokenAddress.toLowerCase()
        }
      )
      const index = tokenStore.erc20TokensWithBalanceAndPriceFromBank.findIndex(
        (token) => {
          const erc20Token = token as Erc20Token

          return erc20Token.address.toLowerCase() === tokenAddress.toLowerCase()
        }
      )

      if (!token || index < 0) {
        return
      }

      const erc20TokensWithBalanceAndPriceFromBankWithUpdatedAllowance = [
        ...tokenStore.erc20TokensWithBalanceAndPriceFromBank
      ]
      erc20TokensWithBalanceAndPriceFromBankWithUpdatedAllowance[index] = {
        ...token,
        allowance: UNLIMITED_ALLOWANCE.toString()
      }

      tokenStore.$patch({
        erc20TokensWithBalanceAndPriceFromBank:
          erc20TokensWithBalanceAndPriceFromBankWithUpdatedAllowance
      })
    },

    async transfer({
      amount,
      token
    }: {
      amount: BigNumberInBase
      token: Token
    }) {
      const bankStore = useBankStore()

      const { address, injectiveAddress, isUserWalletConnected, validate } =
        useWalletStore()
      const { gasPrice, fetchGasPrice, queue } = useAppStore()

      if (!address || !isUserWalletConnected) {
        return
      }

      await fetchGasPrice()
      await validate()
      await queue()

      const ethDestinationAddress = getEthereumAddress(injectiveAddress)
      const actualAmount = new BigNumberInBase(
        amount.toFixed(3, BigNumberInBase.ROUND_DOWN)
      )
        .toWei(token.decimals)
        .toFixed()

      const tx = await web3Composer.getPeggyTransferTx({
        address,
        gasPrice,
        denom: token.denom,
        amount: actualAmount,
        destinationAddress: ethDestinationAddress
      })

      await web3Broadcaster.sendTransaction({
        tx,
        address
      })

      await backupPromiseCall(() => bankStore.fetchBalances())
    },

    async withdraw({
      amount,
      bridgeFee,
      token
    }: {
      amount: BigNumberInBase
      bridgeFee: BigNumberInBase
      token: Token
    }) {
      const appStore = useAppStore()
      const bankStore = useBankStore()

      const { address, injectiveAddress, isUserWalletConnected, validate } =
        useWalletStore()

      if (!address || !isUserWalletConnected) {
        return
      }

      await validate()
      await appStore.queue()

      const amountToFixed = amount.toWei(token.decimals).toFixed(0)
      const actualBridgeFee = new BigNumberInWei(
        bridgeFee.toWei(token.decimals).toFixed(0)
      ).toFixed()

      const actualAmount = new BigNumberInBase(amountToFixed)
        .minus(actualBridgeFee)
        .toFixed(0)

      const message = MsgSendToEth.fromJSON({
        address,
        injectiveAddress,
        amount: {
          denom: token.denom,
          amount: actualAmount
        },
        bridgeFee: {
          denom: token.denom,
          amount: actualBridgeFee
        }
      })

      await msgBroadcastClient.broadcastOld({
        address,
        msgs: message
      })

      await backupPromiseCall(() => bankStore.fetchBalances())
    }
  }
})
