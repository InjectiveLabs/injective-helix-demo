import { defineStore } from 'pinia'
import { MsgSend } from '@injectivelabs/sdk-ts'
import {
  UiBankTransformer,
  BankBalances,
  BankBalanceWithToken,
  IbcBankBalanceWithToken
} from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import {
  BigNumberInBase,
  BigNumberInWei,
  INJ_DENOM
} from '@injectivelabs/utils'
import { bankApi, msgBroadcastClient, tokenService } from '@/app/Services'
import { backupPromiseCall } from '@/app/utils/async'
import { INJ_GAS_BUFFER } from '@/app/utils/constants'

type BankStoreState = {
  balances: BankBalances
  ibcBalances: BankBalances
  bankErc20BalancesWithToken: BankBalanceWithToken[]
  bankIbcBalancesWithToken: IbcBankBalanceWithToken[]
}

const initialStateFactory = (): BankStoreState => ({
  balances: {},
  ibcBalances: {},
  bankErc20BalancesWithToken: [],
  bankIbcBalancesWithToken: []
})

export const useBankStore = defineStore('bank', {
  state: (): BankStoreState => initialStateFactory(),
  getters: {
    hasAnyBankBalance: (state: BankStoreState) => {
      return (
        Object.keys(state.balances).length > 0 ||
        Object.keys(state.ibcBalances).length > 0
      )
    },

    hasEnoughInjForGas: (state: BankStoreState) => {
      if (!state.balances[INJ_DENOM]) {
        return false
      }

      return new BigNumberInWei(state.balances[INJ_DENOM])
        .toBase()
        .gte(INJ_GAS_BUFFER)
    },

    bankBalancesWithToken: (state: BankStoreState) => {
      return [
        ...state.bankErc20BalancesWithToken,
        ...state.bankIbcBalancesWithToken
      ]
    }
  },
  actions: {
    async init() {
      const bankStore = useBankStore()

      await bankStore.fetchBalances()
    },

    async fetchBalances() {
      const bankStore = useBankStore()
      const { injectiveAddress } = useWalletStore()

      if (!injectiveAddress) {
        return
      }

      const { balances } = await bankApi.fetchBalances(injectiveAddress)
      const { bankBalances, ibcBankBalances } =
        UiBankTransformer.bankBalancesToUiBankBalances(balances)

      bankStore.$patch({
        balances: bankBalances,
        ibcBalances: ibcBankBalances
      })
    },

    async fetchBankBalancesWithToken() {
      const bankStore = useBankStore()
      const { injectiveAddress } = useWalletStore()

      if (!injectiveAddress) {
        return
      }

      await bankStore.fetchBalances()

      const { bankBalancesWithToken, ibcBankBalancesWithToken } =
        await tokenService.getBalancesWithToken(
          bankStore.balances,
          bankStore.ibcBalances
        )

      bankStore.$patch({
        bankErc20BalancesWithToken: bankBalancesWithToken,
        bankIbcBalancesWithToken: ibcBankBalancesWithToken
      })
    },

    async transfer({
      amount,
      denom,
      memo,
      destination,
      token
    }: {
      amount: BigNumberInBase
      denom: string
      memo?: string
      destination: string
      token: Token
    }) {
      const bankStore = useBankStore()
      const { address, injectiveAddress, isUserWalletConnected, validate } =
        useWalletStore()

      if (!address || !isUserWalletConnected) {
        return
      }

      await validate()

      const message = MsgSend.fromJSON({
        srcInjectiveAddress: injectiveAddress,
        dstInjectiveAddress: destination,
        amount: {
          denom,
          amount: amount.toWei(token.decimals).toFixed()
        }
      })

      await msgBroadcastClient.broadcastOld({
        msgs: message,
        memo,
        address
      })

      await backupPromiseCall(() => bankStore.fetchBalances())
    }
  }
})
