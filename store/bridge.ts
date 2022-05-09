import { actionTree, getterTree } from 'typed-vuex'
import { BankMsgSendTransaction } from '@injectivelabs/explorer-consumer'
import {
  IBCTransferTx,
  PeggyDepositTx,
  PeggyWithdrawalTx,
  UiBridgeTransactionWithToken,
  UiSubaccountTransfer
} from '@injectivelabs/ui-common'
import { ExplorerTransformer } from '~/app/services/explorer'
import { BridgeTransformer } from '~/app/services/bridge'
import {
  explorerService,
  bridgeTransformer,
  bridgeService,
  tokenService,
  subaccountService
} from '~/app/Services'

const initialStateFactory = () => ({
  ibcTransferTransactions: [] as IBCTransferTx[],
  ibcTransferBridgeTransactions: [] as UiBridgeTransactionWithToken[],
  peggyDepositTransactions: [] as PeggyDepositTx[],
  peggyWithdrawalTransactions: [] as PeggyWithdrawalTx[],
  peggyDepositBridgeTransactions: [] as UiBridgeTransactionWithToken[],
  peggyWithdrawalBridgeTransactions: [] as UiBridgeTransactionWithToken[],
  injectiveTransfers: [] as BankMsgSendTransaction[],
  injectiveTransferBridgeTransactions: [] as UiBridgeTransactionWithToken[],
  subaccountTransfers: [] as UiSubaccountTransfer[],
  subaccountTransferBridgeTransactions: [] as UiBridgeTransactionWithToken[]
})
const initialState = initialStateFactory()

export const state = () => ({
  ibcTransferTransactions: initialState.ibcTransferTransactions as IBCTransferTx[],
  ibcTransferBridgeTransactions: initialState.ibcTransferBridgeTransactions as UiBridgeTransactionWithToken[],

  peggyDepositTransactions: initialState.peggyDepositTransactions as PeggyDepositTx[],
  peggyDepositBridgeTransactions: initialState.peggyDepositBridgeTransactions as UiBridgeTransactionWithToken[],

  peggyWithdrawalTransactions: initialState.peggyWithdrawalTransactions as PeggyWithdrawalTx[],
  peggyWithdrawalBridgeTransactions: initialState.peggyWithdrawalBridgeTransactions as UiBridgeTransactionWithToken[],

  injectiveTransfers: initialState.injectiveTransfers as BankMsgSendTransaction[],
  injectiveTransferBridgeTransactions: initialState.injectiveTransferBridgeTransactions as UiBridgeTransactionWithToken[],

  subaccountTransfers: initialState.subaccountTransfers as UiSubaccountTransfer[],
  subaccountTransferBridgeTransactions: initialState.subaccountTransferBridgeTransactions as UiBridgeTransactionWithToken[]
})

export type BridgeStoreState = ReturnType<typeof state>

export const getters = getterTree(state, {
  withdrawalTransactions: (state: BridgeStoreState, _, { wallet }) => {
    const { injectiveAddress } = wallet
    const ibcWithdrawalTransactions = state.ibcTransferBridgeTransactions.filter(
      (transaction) => transaction.sender.startsWith('inj')
    )
    const injectiveWithdrawalTransactions = state.injectiveTransferBridgeTransactions.filter(
      (transaction) => transaction.sender === injectiveAddress
    )

    return [
      ...state.peggyWithdrawalBridgeTransactions,
      ...ibcWithdrawalTransactions,
      ...injectiveWithdrawalTransactions
    ]
  },

  depositTransactions: (state: BridgeStoreState, _, { wallet }) => {
    const { injectiveAddress } = wallet
    const ibcDepositsTransactions = state.ibcTransferBridgeTransactions.filter(
      (transaction) => transaction.receiver.startsWith('inj')
    )

    const injectiveDepositTransactions = state.injectiveTransferBridgeTransactions.filter(
      (transaction) => transaction.receiver === injectiveAddress
    )

    return [
      ...state.peggyDepositBridgeTransactions,
      ...ibcDepositsTransactions,
      ...injectiveDepositTransactions
    ]
  }
})

export const mutations = {
  setIbcTransferTransactions(
    state: BridgeStoreState,
    ibcTransferTransactions: IBCTransferTx[]
  ) {
    state.ibcTransferTransactions = ibcTransferTransactions
  },

  setIbcTransferBridgeTransactions(
    state: BridgeStoreState,
    ibcTransferBridgeTransactions: UiBridgeTransactionWithToken[]
  ) {
    state.ibcTransferBridgeTransactions = ibcTransferBridgeTransactions
  },

  setPeggyDepositTransactions(
    state: BridgeStoreState,
    peggyDepositTransactions: PeggyDepositTx[]
  ) {
    state.peggyDepositTransactions = peggyDepositTransactions
  },

  setPeggyWithdrawalTransactions(
    state: BridgeStoreState,
    peggyWithdrawalTransactions: PeggyWithdrawalTx[]
  ) {
    state.peggyWithdrawalTransactions = peggyWithdrawalTransactions
  },

  setPeggyDepositBridgeTransactions(
    state: BridgeStoreState,
    peggyDepositBridgeTransactions: UiBridgeTransactionWithToken[]
  ) {
    state.peggyDepositBridgeTransactions = peggyDepositBridgeTransactions
  },

  setPeggyWithdrawalBridgeTransactions(
    state: BridgeStoreState,
    peggyWithdrawalBridgeTransactions: UiBridgeTransactionWithToken[]
  ) {
    state.peggyWithdrawalBridgeTransactions = peggyWithdrawalBridgeTransactions
  },

  setInjectiveTransferTransactions(
    state: BridgeStoreState,
    injectiveTransfers: BankMsgSendTransaction[]
  ) {
    state.injectiveTransfers = injectiveTransfers
  },

  setInjectiveTransferBridgeTransactions(
    state: BridgeStoreState,
    injectiveTransferBridgeTransactions: UiBridgeTransactionWithToken[]
  ) {
    state.injectiveTransferBridgeTransactions = injectiveTransferBridgeTransactions
  },

  setSubaccountTransferTransactions(
    state: BridgeStoreState,
    subaccountTransfers: UiSubaccountTransfer[]
  ) {
    state.subaccountTransfers = subaccountTransfers
  },

  setSubaccountTransferBridgeTransactions(
    state: BridgeStoreState,
    subaccountTransferBridgeTransactions: UiBridgeTransactionWithToken[]
  ) {
    state.subaccountTransferBridgeTransactions = subaccountTransferBridgeTransactions
  },

  reset(state: BridgeStoreState) {
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

    state.injectiveTransfers = initialState.injectiveTransfers
    state.injectiveTransferBridgeTransactions =
      initialState.injectiveTransferBridgeTransactions

    state.subaccountTransfers = initialState.subaccountTransfers
    state.subaccountTransferBridgeTransactions =
      initialState.subaccountTransferBridgeTransactions
  }
}

export const actions = actionTree(
  { state },
  {
    async fetchInjectiveTransactions({ commit }) {
      const {
        injectiveAddress,
        isUserWalletConnected
      } = this.app.$accessor.wallet

      if (!injectiveAddress || !isUserWalletConnected) {
        return
      }

      const transfers = await explorerService.fetchAccountTransactions({
        address: injectiveAddress,
        limit: -1,
        type: 'cosmos.bank.v1beta1.MsgSend'
      })

      const transactions = (transfers || [])
        .map(ExplorerTransformer.transactionMessageToBankMsgSendTransaction)
        .map(
          BridgeTransformer.convertBankMsgSendTransactionToUiBridgeTransaction
        )

      const uiBridgeTransactionsWithToken = await tokenService.getBridgeTransactionsWithToken(
        transactions
      )

      commit('setSubaccountTransferTransactions', transactions)
      commit(
        'setInjectiveTransferBridgeTransactions',
        uiBridgeTransactionsWithToken
      )
    },

    async fetchSubaccountTransfers({ commit }) {
      const { subaccount } = this.app.$accessor.account
      const { isUserWalletConnected } = this.app.$accessor.wallet

      if (!isUserWalletConnected || !subaccount) {
        return
      }

      const transfers = await subaccountService.fetchSubaccountTransfers(
        subaccount.subaccountId
      )
      const transactions = transfers.map(
        BridgeTransformer.convertSubaccountTransfersToUiBridgeTransaction
      )

      const uiBridgeTransactionsWithToken = await tokenService.getBridgeTransactionsWithToken(
        transactions
      )

      commit('setSubaccountTransferTransactions', transactions)
      commit(
        'setSubaccountTransferBridgeTransactions',
        uiBridgeTransactionsWithToken
      )
    },

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
