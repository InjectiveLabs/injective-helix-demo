import {
  BridgeTransactionState,
  getExplorerUrl,
  UiBridgeTransaction,
  UiSubaccountTransfer
} from '@injectivelabs/ui-common'
import { BankMsgSendTransaction } from '@injectivelabs/explorer-consumer'
import { TransferType } from '@injectivelabs/subaccount-consumer'
import { NETWORK } from '~/app/utils/constants'

export const convertBankMsgSendTransactionToUiBridgeTransaction = (
  transaction: BankMsgSendTransaction
): UiBridgeTransaction => {
  return {
    amount: transaction.amount,
    denom: transaction.denom,
    receiver: transaction.receiver,
    sender: transaction.sender,
    txHash: transaction.hash,
    explorerLink: `${getExplorerUrl(NETWORK)}/transaction/${transaction.hash}`,
    timestamp: Date.parse(transaction.blockTimestamp),
    state: BridgeTransactionState.Completed,
    blockHeight: transaction.blockNumber
  }
}

export const convertSubaccountTransfersToUiBridgeTransaction = (
  transaction: UiSubaccountTransfer
): UiBridgeTransaction => {
  const isDeposit = transaction.transferType === TransferType.Deposit

  const sender = isDeposit
    ? transaction.srcSubaccountAddress
    : transaction.srcSubaccountId
  const receiver = isDeposit
    ? transaction.dstSubaccountId
    : transaction.dstSubaccountAddress

  return {
    sender,
    receiver,
    amount: transaction.amount,
    denom: transaction.denom,
    txHash: '',
    explorerLink: `${getExplorerUrl(NETWORK)}/account/${receiver}`,
    timestamp: transaction.executedAt,
    state: BridgeTransactionState.Completed
  }
}
