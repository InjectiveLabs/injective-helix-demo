import {
  Token,
  TokenWithBalance,
  TokenWithBalanceAndPrice,
  UNLIMITED_ALLOWANCE,
  INJ_COIN_GECKO_ID,
  BankBalanceWithToken
} from '@injectivelabs/ui-common'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { actionTree, getterTree } from 'typed-vuex'
import {
  peggyActionServiceFactory,
  tokenCoinGeckoService,
  tokenErc20ActionServiceFactory,
  tokenErc20Service
} from '~/app/Services'
import { BTC_COIN_GECKO_ID } from '~/app/utils/constants'
import { backupPromiseCall } from '~/app/utils/async'
import { getTradableTokenMetaWithBalanceAndPrice } from '~/app/utils/token'

const initialStateFactory = () => ({
  erc20TokensWithBalanceAndPriceFromBank: [] as TokenWithBalanceAndPrice[],
  ibcTokensWithBalanceAndPriceFromBank: [] as TokenWithBalanceAndPrice[],
  tradableSymbolsWithTokenMeta: getTradableTokenMetaWithBalanceAndPrice() as TokenWithBalanceAndPrice[],
  btcUsdPrice: 0 as number,
  injUsdPrice: 0 as number
})

const initialState = initialStateFactory()

export const state = () => ({
  erc20TokensWithBalanceAndPriceFromBank: initialState.erc20TokensWithBalanceAndPriceFromBank as TokenWithBalanceAndPrice[],
  ibcTokensWithBalanceAndPriceFromBank: initialState.ibcTokensWithBalanceAndPriceFromBank as TokenWithBalanceAndPrice[],
  tradableSymbolsWithTokenMeta: initialState.tradableSymbolsWithTokenMeta as TokenWithBalanceAndPrice[],
  btcUsdPrice: initialState.btcUsdPrice as number,
  injUsdPrice: initialState.injUsdPrice as number
})

export type TokenStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  //
})

export const mutations = {
  setErc20TokensWithBalanceAndPriceFromBank(
    state: TokenStoreState,
    erc20TokensWithBalanceAndPriceFromBank: TokenWithBalanceAndPrice[]
  ) {
    state.erc20TokensWithBalanceAndPriceFromBank = erc20TokensWithBalanceAndPriceFromBank
  },

  setIbcTokensWithBalanceAndPriceFromBank(
    state: TokenStoreState,
    ibcTokensWithBalanceAndPriceFromBank: TokenWithBalanceAndPrice[]
  ) {
    state.ibcTokensWithBalanceAndPriceFromBank = ibcTokensWithBalanceAndPriceFromBank
  },

  setBtcUsdPrice(state: TokenStoreState, btcUsdPrice: number) {
    state.btcUsdPrice = btcUsdPrice
  },

  setInjUsdPrice(state: TokenStoreState, injUsdPrice: number) {
    state.injUsdPrice = injUsdPrice
  },

  reset(state: TokenStoreState) {
    const initialState = initialStateFactory()

    state.erc20TokensWithBalanceAndPriceFromBank =
      initialState.erc20TokensWithBalanceAndPriceFromBank
    state.ibcTokensWithBalanceAndPriceFromBank =
      initialState.ibcTokensWithBalanceAndPriceFromBank
    state.injUsdPrice = initialState.injUsdPrice
    state.btcUsdPrice = initialState.btcUsdPrice
  }
}

export const actions = actionTree(
  { state },
  {
    async getErc20TokensWithBalanceAndPriceFromBank({ commit }) {
      const { address, isUserWalletConnected } = this.app.$accessor.wallet

      if (!address || !isUserWalletConnected) {
        return
      }

      const {
        bankErc20BalancesWithToken,
        bankIbcBalancesWithToken
      } = this.app.$accessor.bank

      const tokenToTokenWithBalanceAndAllowance = async ({
        token
      }: BankBalanceWithToken) => {
        const tokenWithBalance = await tokenErc20Service.fetchTokenBalanceAndAllowance(
          {
            address,
            token
          }
        )

        return {
          ...tokenWithBalance,
          usdPrice: await tokenCoinGeckoService.fetchUsdTokenPriceFromCoinGecko(
            token.coinGeckoId
          )
        } as TokenWithBalanceAndPrice
      }

      const ercTokensWithBalanceAndAllowance = await Promise.all(
        bankErc20BalancesWithToken.map(tokenToTokenWithBalanceAndAllowance)
      )

      const ibcTokensWithBalanceAndPriceFromBank = await Promise.all(
        bankIbcBalancesWithToken.map(tokenToTokenWithBalanceAndAllowance)
      )

      commit(
        'setErc20TokensWithBalanceAndPriceFromBank',
        ercTokensWithBalanceAndAllowance
      )
      commit(
        'setIbcTokensWithBalanceAndPriceFromBank',
        ibcTokensWithBalanceAndPriceFromBank
      )
    },

    async getInjUsdPrice({ commit }) {
      commit(
        'setInjUsdPrice',
        await tokenCoinGeckoService.fetchUsdTokenPriceFromCoinGecko(
          INJ_COIN_GECKO_ID
        )
      )
    },

    async getBitcoinUsdPrice({ commit }) {
      commit(
        'setBtcUsdPrice',
        await tokenCoinGeckoService.fetchUsdTokenPriceFromCoinGecko(
          BTC_COIN_GECKO_ID
        )
      )
    },

    async setTokenAllowance(
      { state, commit },
      { address: tokenAddress }: TokenWithBalance
    ) {
      const { address } = this.app.$accessor.wallet
      const { gasPrice } = this.app.$accessor.app
      const tokenErc20ActionService = tokenErc20ActionServiceFactory()

      await this.app.$accessor.wallet.validate()

      await tokenErc20ActionService.setTokenAllowance({
        address,
        tokenAddress,
        gasPrice,
        amount: UNLIMITED_ALLOWANCE.toFixed()
      })

      const { erc20TokensWithBalanceAndPriceFromBank } = state
      const token = erc20TokensWithBalanceAndPriceFromBank.find(
        (token) => token.address.toLowerCase() === tokenAddress.toLowerCase()
      )
      const index = erc20TokensWithBalanceAndPriceFromBank.findIndex(
        (token) => token.address.toLowerCase() === tokenAddress.toLowerCase()
      )

      if (!token || index < 0) {
        return
      }

      commit(
        'setErc20TokensWithBalanceAndPriceFromBank',
        erc20TokensWithBalanceAndPriceFromBank.splice(index, 1, {
          ...token,
          allowance: UNLIMITED_ALLOWANCE.toString()
        })
      )
    },

    async transfer(
      _,
      { amount, token }: { amount: BigNumberInBase; token: Token }
    ) {
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet
      const { gasPrice } = this.app.$accessor.app
      const peggyActionService = peggyActionServiceFactory()

      if (!address || !isUserWalletConnected) {
        return
      }

      await this.app.$accessor.wallet.validate()

      await peggyActionService.transfer({
        address,
        gasPrice,
        destinationAddress: injectiveAddress,
        denom: token.denom,
        amount: new BigNumberInBase(
          amount.toFixed(3, BigNumberInBase.ROUND_DOWN)
        )
          .toWei(token.decimals)
          .toFixed()
      })

      await backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
    },

    async withdraw(
      _,
      {
        amount,
        bridgeFee,
        token
      }: {
        amount: BigNumberInBase
        bridgeFee: BigNumberInBase
        token: Token
      }
    ) {
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet
      const peggyActionService = peggyActionServiceFactory()

      if (!address || !isUserWalletConnected) {
        return
      }

      await this.app.$accessor.wallet.validate()

      await peggyActionService.withdraw({
        address,
        injectiveAddress,
        denom: token.denom,
        destinationAddress: address,
        amount: amount.toWei(token.decimals).toFixed(0),
        bridgeFee: new BigNumberInWei(
          bridgeFee.toWei(token.decimals).toFixed(0)
        ).toFixed(0)
      })

      await backupPromiseCall(() => this.app.$accessor.bank.fetchBalances())
    }
  }
)
