import {
  BridgeTransactionState,
  getExplorerUrl,
  UiBridgeTransaction,
  UiSubaccountTransfer,
  getInjectiveAddress
} from '@injectivelabs/ui-common'
import { BankMsgSendTransaction } from '@injectivelabs/explorer-consumer'
import { TransferType } from '@injectivelabs/subaccount-consumer'
// import { Network } from '@injectivelabs/networks'
import { NETWORK } from '~/app/utils/constants'

const convertBankMsgSendTransactionToUiBridgeTransaction = (
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

const convertSubaccountTransfersToUiBridgeTransaction = (
  transaction: UiSubaccountTransfer
): UiBridgeTransaction => {
  const isDeposit = transaction.transferType === TransferType.Deposit

  const sender = isDeposit
    ? transaction.srcSubaccountAddress
    : transaction.srcSubaccountId
  const receiver = isDeposit
    ? transaction.dstSubaccountId
    : transaction.dstSubaccountAddress

  const explorerAccount = isDeposit
    ? getInjectiveAddress(receiver.slice(0, -24))
    : receiver

  return {
    sender,
    receiver,
    amount: transaction.amount,
    denom: transaction.denom,
    txHash: '',
    explorerLink: `${getExplorerUrl(NETWORK)}/account/${explorerAccount}`,
    timestamp: transaction.executedAt,
    state: BridgeTransactionState.Completed
  }
}

export class BridgeTransformer {
  static convertBankMsgSendTransactionToUiBridgeTransaction = convertBankMsgSendTransactionToUiBridgeTransaction

  static convertSubaccountTransfersToUiBridgeTransaction = convertSubaccountTransfersToUiBridgeTransaction
}
