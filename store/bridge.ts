import { actionTree, getterTree } from 'typed-vuex'
import {
  IBCTransferTx,
  PeggyDepositTx,
  PeggyWithdrawalTx,
  UiBridgeTransactionWithToken
} from '@injectivelabs/ui-common'
import { bridgeTransformer, bridgeService, tokenService } from '~/app/Services'

const initialStateFactory = () => ({
  ibcTransferTransactions: [] as IBCTransferTx[],
  ibcTransferBridgeTransactions: [] as UiBridgeTransactionWithToken[],
  peggyDepositTransactions: [] as PeggyDepositTx[],
  peggyWithdrawalTransactions: [] as PeggyWithdrawalTx[],
  peggyDepositBridgeTransactions: [] as UiBridgeTransactionWithToken[],
  peggyWithdrawalBridgeTransactions: [] as UiBridgeTransactionWithToken[]
})
const initialState = initialStateFactory()

export const state = () => ({
  ibcTransferTransactions: initialState.ibcTransferTransactions as IBCTransferTx[],
  ibcTransferBridgeTransactions: initialState.ibcTransferBridgeTransactions as UiBridgeTransactionWithToken[],
  peggyDepositTransactions: initialState.peggyDepositTransactions as PeggyDepositTx[],
  peggyWithdrawalTransactions: initialState.peggyWithdrawalTransactions as PeggyWithdrawalTx[],
  peggyDepositBridgeTransactions: initialState.peggyDepositBridgeTransactions as UiBridgeTransactionWithToken[],
  peggyWithdrawalBridgeTransactions: initialState.peggyWithdrawalBridgeTransactions as UiBridgeTransactionWithToken[]
})

export type BridgingStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  withdrawalTransactions: (state: BridgingStoreState) => {
    const ibcWithdrawalTransactions = state.ibcTransferBridgeTransactions.filter(
      (transaction) => transaction.sender.startsWith('inj')
    )

    return [
      ...state.peggyWithdrawalBridgeTransactions,
      ...ibcWithdrawalTransactions
    ]
  },

  depositTransactions: (state: BridgingStoreState) => {
    const ibcDepositsTransactions = state.ibcTransferBridgeTransactions.filter(
      (transaction) => transaction.receiver.startsWith('inj')
    )

    return [...state.peggyDepositBridgeTransactions, ...ibcDepositsTransactions]
  }
})

export const mutations = {
  setIbcTransferTransactions(
    state: BridgingStoreState,
    ibcTransferTransactions: IBCTransferTx[]
  ) {
    state.ibcTransferTransactions = ibcTransferTransactions
  },

  setIbcTransferBridgeTransactions(
    state: BridgingStoreState,
    ibcTransferBridgeTransactions: UiBridgeTransactionWithToken[]
  ) {
    state.ibcTransferBridgeTransactions = ibcTransferBridgeTransactions
  },

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

    state.ibcTransferTransactions = initialState.ibcTransferTransactions
    state.ibcTransferBridgeTransactions =
      initialState.ibcTransferBridgeTransactions

    state.peggyDepositTransactions = initialState.peggyDepositTransactions
    state.peggyDepositBridgeTransactions =
      initialState.peggyDepositBridgeTransactions

    state.peggyWithdrawalTransactions = initialState.peggyWithdrawalTransactions
    state.peggyWithdrawalBridgeTransactions =
      initialState.peggyWithdrawalBridgeTransactions
  }
}

export const actions = actionTree(
  { state },
  {
    async fetchIBCTransferTransactions({ commit }) {
      const {
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (!injectiveAddress || !isUserWalletConnected) {
        return
      }

      const transactions = await bridgeService.fetchIBCTransferTransactions(
        injectiveAddress
      )

      const uiBridgeTransactions = await Promise.all(
        transactions.map(
          async (transaction: IBCTransferTx) =>
            await bridgeTransformer.convertIBCTransferTxToUiBridgeTransaction(
              transaction
            )
        )
      )
      const uiBridgeTransactionsWithToken = await tokenService.getBridgeTransactionsWithToken(
        uiBridgeTransactions
      )

      commit('setIbcTransferTransactions', transactions)
      commit('setIbcTransferBridgeTransactions', uiBridgeTransactionsWithToken)
    },

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
