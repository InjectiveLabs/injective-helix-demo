import { defineStore } from 'pinia'
import {
  IBCTransferTx,
  PeggyDepositTx,
  PeggyWithdrawalTx,
  UiSubaccountTransfer,
  UiAccountTransformer,
  UiBridgeTransactionWithToken
} from '@injectivelabs/sdk-ui-ts'
import { BankMsgSendTransaction } from '@injectivelabs/sdk-ts'
import {
  tokenService,
  bridgeTransformer,
  indexerAccountApi,
  indexerExplorerApi
} from '@/app/Services'
import { UiBridgeTransformer } from '@/app/client/transformers/UiBridgeTransformer'
import { UiExplorerTransformer } from '@/app/client/transformers/UiExplorerTransformer'
import { ActivityFetchOptions } from '@/types'

type BridgeStoreState = {
  ibcTransferTransactions: IBCTransferTx[]
  ibcTransferBridgeTransactions: UiBridgeTransactionWithToken[]
  peggyDepositTransactions: PeggyDepositTx[]
  peggyWithdrawalTransactions: PeggyWithdrawalTx[]
  peggyDepositBridgeTransactions: UiBridgeTransactionWithToken[]
  peggyWithdrawalBridgeTransactions: UiBridgeTransactionWithToken[]
  injectiveTransfers: BankMsgSendTransaction[]
  injectiveTransferBridgeTransactions: UiBridgeTransactionWithToken[]
  subaccountTransfers: UiSubaccountTransfer[]
  subaccountTransferBridgeTransactions: UiBridgeTransactionWithToken[]
  subaccountTransferBridgeTransactionsCount: number
}

const initialStateFactory = (): BridgeStoreState => ({
  ibcTransferTransactions: [],
  ibcTransferBridgeTransactions: [],
  peggyDepositTransactions: [],
  peggyWithdrawalTransactions: [],
  peggyDepositBridgeTransactions: [],
  peggyWithdrawalBridgeTransactions: [],
  injectiveTransfers: [],
  injectiveTransferBridgeTransactions: [],
  subaccountTransfers: [],
  subaccountTransferBridgeTransactions: [],
  subaccountTransferBridgeTransactionsCount: 0
})

export const useBridgeStore = defineStore('bridge', {
  state: (): BridgeStoreState => initialStateFactory(),
  getters: {
    withdrawalTransactions: (state: BridgeStoreState) => {
      const { injectiveAddress } = useWalletStore()

      const ibcWithdrawalTransactions =
        state.ibcTransferBridgeTransactions.filter((transaction) =>
          transaction.sender.startsWith('inj')
        )
      const injectiveWithdrawalTransactions =
        state.injectiveTransferBridgeTransactions.filter(
          (transaction) => transaction.sender === injectiveAddress
        )

      return [
        ...state.peggyWithdrawalBridgeTransactions,
        ...ibcWithdrawalTransactions,
        ...injectiveWithdrawalTransactions
      ]
    },

    depositTransactions: (state: BridgeStoreState) => {
      const { injectiveAddress } = useWalletStore()

      const ibcDepositsTransactions =
        state.ibcTransferBridgeTransactions.filter((transaction) =>
          transaction.receiver.startsWith('inj')
        )

      const injectiveDepositTransactions =
        state.injectiveTransferBridgeTransactions.filter(
          (transaction) => transaction.receiver === injectiveAddress
        )

      return [
        ...state.peggyDepositBridgeTransactions,
        ...ibcDepositsTransactions,
        ...injectiveDepositTransactions
      ]
    }
  },
  actions: {
    async fetchInjectiveTransactions() {
      const bridgeStore = useBridgeStore()
      const { injectiveAddress, isUserWalletConnected } = useWalletStore()

      if (!injectiveAddress || !isUserWalletConnected) {
        return
      }

      const { txs } = await indexerExplorerApi.fetchAccountTx({
        address: injectiveAddress,
        limit: -1,
        type: 'cosmos.bank.v1beta1.MsgSend'
      })

      const transactions = (txs || [])
        .filter((tx) => tx.messages)
        .map(UiExplorerTransformer.transactionMessageToBankMsgSendTransaction)
        .filter((tx) => tx.amount)
        .map(
          UiBridgeTransformer.convertBankMsgSendTransactionToUiBridgeTransaction
        )

      const uiBridgeTransactionsWithToken =
        await tokenService.toBridgeTransactionsWithToken(transactions)

      bridgeStore.$patch({
        subaccountTransferBridgeTransactions: transactions,
        injectiveTransferBridgeTransactions: uiBridgeTransactionsWithToken
      })
    },

    async fetchSubaccountTransfers(options: ActivityFetchOptions | undefined) {
      const bridgeStore = useBridgeStore()
      const { subaccountId } = useAccountStore()
      const { isUserWalletConnected } = useWalletStore()

      if (!isUserWalletConnected || !subaccountId) {
        return
      }

      const filters = options?.filters

      const { transfers, pagination } =
        await indexerAccountApi.fetchSubaccountHistory({
          subaccountId,
          denom: filters?.denom,
          pagination: options?.pagination
        })

      const uiTransfers = transfers.map(
        UiAccountTransformer.grpcAccountTransferToUiAccountTransfer
      )

      const transactions = uiTransfers.map(
        UiBridgeTransformer.convertSubaccountTransfersToUiBridgeTransaction
      )

      const uiBridgeTransactionsWithToken =
        await tokenService.toBridgeTransactionsWithToken(transactions)

      bridgeStore.$patch({
        subaccountTransferBridgeTransactions: uiBridgeTransactionsWithToken,
        subaccountTransferBridgeTransactionsCount: pagination.total
      })
    },

    async fetchIBCTransferTransactions() {
      const bridgeStore = useBridgeStore()
      const { injectiveAddress, isUserWalletConnected } = useWalletStore()

      if (!injectiveAddress || !isUserWalletConnected) {
        return
      }

      const transactions = await indexerExplorerApi.fetchIBCTransferTxs({
        sender: injectiveAddress,
        receiver: injectiveAddress
      })

      const uiBridgeTransactions = await Promise.all(
        transactions.map(
          async (transaction: IBCTransferTx) =>
            await bridgeTransformer.convertIBCTransferTxToUiBridgeTransaction(
              transaction
            )
        )
      )
      const uiBridgeTransactionsWithToken =
        await tokenService.toBridgeTransactionsWithToken(uiBridgeTransactions)

      bridgeStore.$patch({
        ibcTransferTransactions: transactions,
        ibcTransferBridgeTransactions: uiBridgeTransactionsWithToken
      })
    },

    async fetchPeggyDepositTransactions() {
      const bridgeStore = useBridgeStore()
      const { address, injectiveAddress, isUserWalletConnected } =
        useWalletStore()

      if (!address || !isUserWalletConnected) {
        return
      }

      const transactions = await indexerExplorerApi.fetchPeggyDepositTxs({
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
      const uiBridgeTransactionsWithToken =
        await tokenService.toBridgeTransactionsWithToken(uiBridgeTransactions)

      bridgeStore.$patch({
        peggyDepositTransactions: transactions,
        peggyDepositBridgeTransactions: uiBridgeTransactionsWithToken
      })
    },

    async fetchPeggyWithdrawalTransactions() {
      const bridgeStore = useBridgeStore()
      const { address, injectiveAddress, isUserWalletConnected } =
        useWalletStore()

      if (!address || !isUserWalletConnected) {
        return
      }

      const transactions = await indexerExplorerApi.fetchPeggyWithdrawalTxs({
        sender: injectiveAddress,
        receiver: address
      })

      const uiBridgeTransactions = await Promise.all(
        transactions.map(
          async (transaction: PeggyWithdrawalTx) =>
            await bridgeTransformer.convertPeggyWithdrawalTxToUiBridgeTransaction(
              transaction
            )
        )
      )
      const uiBridgeTransactionsWithToken =
        await tokenService.toBridgeTransactionsWithToken(uiBridgeTransactions)

      bridgeStore.$patch({
        peggyWithdrawalTransactions: transactions,
        peggyWithdrawalBridgeTransactions: uiBridgeTransactionsWithToken
      })
    },

    reset() {
      useBridgeStore().$reset()
    }
  }
})
