import { actionTree } from 'typed-vuex'
import {
  PeggyDepositTx,
  PeggyWithdrawalTx,
  UiBridgeTransactionWithToken
} from '@injectivelabs/ui-common'
import { bridgeTransformer, bridgeService, tokenService } from '~/app/Services'

const initialStateFactory = () => ({
  peggyDepositTransactions: [] as PeggyDepositTx[],
  peggyWithdrawalTransactions: [] as PeggyWithdrawalTx[],
  peggyDepositBridgeTransactions: [] as UiBridgeTransactionWithToken[],
  peggyWithdrawalBridgeTransactions: [] as UiBridgeTransactionWithToken[]
})
const initialState = initialStateFactory()

export const state = () => ({
  peggyDepositTransactions: initialState.peggyDepositTransactions as PeggyDepositTx[],
  peggyWithdrawalTransactions: initialState.peggyWithdrawalTransactions as PeggyWithdrawalTx[],
  peggyDepositBridgeTransactions: initialState.peggyDepositBridgeTransactions as UiBridgeTransactionWithToken[],
  peggyWithdrawalBridgeTransactions: initialState.peggyWithdrawalBridgeTransactions as UiBridgeTransactionWithToken[]
})

export type BridgingStoreState = ReturnType<typeof state>

export const mutations = {
  setPeggyDepositTransactions(
    state: BridgingStoreState,
    peggyDepositTransactions: PeggyDepositTx[]
  ) {
    state.peggyDepositTransactions = peggyDepositTransactions
  },

  setPeggyWithdrawalTransactions(
    state: BridgingStoreState,
    peggyWithdrawalTransactions: PeggyWithdrawalTx[]
  ) {
    state.peggyWithdrawalTransactions = peggyWithdrawalTransactions
  },

  setPeggyDepositBridgeTransactions(
    state: BridgingStoreState,
    peggyDepositBridgeTransactions: UiBridgeTransactionWithToken[]
  ) {
    state.peggyDepositBridgeTransactions = peggyDepositBridgeTransactions
  },

  setPeggyWithdrawalBridgeTransactions(
    state: BridgingStoreState,
    peggyWithdrawalBridgeTransactions: UiBridgeTransactionWithToken[]
  ) {
    state.peggyWithdrawalBridgeTransactions = peggyWithdrawalBridgeTransactions
  },

  reset(state: BridgingStoreState) {
    const initialState = initialStateFactory()

    state.peggyDepositTransactions = initialState.peggyDepositTransactions
    state.peggyWithdrawalTransactions = initialState.peggyWithdrawalTransactions
  }
}

export const actions = actionTree(
  { state },
  {
    async fetchPeggyDepositTransactions({ commit }) {
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (!address || !isUserWalletConnected) {
        return
      }

      const transactions = await bridgeService.fetchPeggyDepositTransactions({
        sender: address,
        receiver: injectiveAddress
      })

      const uiBridgeTransactions = await Promise.all(
        transactions.map(
          async (transaction: PeggyDepositTx) =>
            await bridgeTransformer.convertPeggyDepositTxToUiBridgeTransaction(
              transaction
            )
        )
      )
      const uiBridgeTransactionsWithToken = await tokenService.getBridgeTransactionsWithToken(
        uiBridgeTransactions
      )

      commit('setPeggyDepositTransactions', transactions)
      commit('setPeggyDepositBridgeTransactions', uiBridgeTransactionsWithToken)
    },

    async fetchPeggyWithdrawalTransactions({ commit }) {
      const {
        address,
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (!address || !isUserWalletConnected) {
        return
      }

      const transactions = await bridgeService.fetchPeggyWithdrawalTransactions(
        {
          sender: injectiveAddress,
          receiver: address
        }
      )

      const uiBridgeTransactions = await Promise.all(
        transactions.map(
          async (transaction: PeggyWithdrawalTx) =>
            await bridgeTransformer.convertPeggyWithdrawalTxToUiBridgeTransaction(
              transaction
            )
        )
      )
      const uiBridgeTransactionsWithToken = await tokenService.getBridgeTransactionsWithToken(
        uiBridgeTransactions
      )

      commit('setPeggyWithdrawalTransactions', transactions)
      commit(
        'setPeggyWithdrawalBridgeTransactions',
        uiBridgeTransactionsWithToken
      )
    },

    async reset({ commit }) {
      await Promise.resolve(commit('reset'))
    }
  }
)
