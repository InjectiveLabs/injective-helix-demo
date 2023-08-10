import {
  MsgSend,
  MsgDeposit,
  MsgWithdraw,
  msgsOrMsgExecMsgs,
  MsgExternalTransfer,
  denomAmountToChainDenomAmountToFixed
} from '@injectivelabs/sdk-ts'
import type { Token } from '@injectivelabs/token-metadata'
import { BigNumberInBase } from '@injectivelabs/utils'
import { msgBroadcastClient } from '@/app/Services'
import { backupPromiseCall } from '@/app/utils/async'

export const deposit = async ({
  amount,
  token,
  subaccountId
}: {
  amount: BigNumberInBase
  token: Token
  subaccountId?: string
}) => {
  const accountStore = useAccountStore()
  const appStore = useAppStore()
  const walletStore = useWalletStore()

  if (!accountStore.subaccountId || !walletStore.isUserWalletConnected) {
    return
  }

  await appStore.queue()
  await walletStore.validate()

  const message = MsgDeposit.fromJSON({
    injectiveAddress: walletStore.injectiveAddress,
    subaccountId: subaccountId || accountStore.subaccountId,
    amount: {
      denom: token.denom,
      amount: denomAmountToChainDenomAmountToFixed({
        value: amount,
        decimals: token.decimals
      })
    }
  })

  const actualMessage = msgsOrMsgExecMsgs(message, walletStore.authZ.address)

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: actualMessage,
    address: walletStore.address
  })

  await backupPromiseCall(() => accountStore.fetchAccountPortfolio())
}

export const withdraw = async ({
  amount,
  token,
  subaccountId
}: {
  amount: BigNumberInBase
  token: Token
  subaccountId?: string
}) => {
  const accountStore = useAccountStore()
  const appStore = useAppStore()
  const walletStore = useWalletStore()

  if (!accountStore.subaccountId || !walletStore.isUserWalletConnected) {
    return
  }

  await appStore.queue()
  await walletStore.validate()

  const message = MsgWithdraw.fromJSON({
    injectiveAddress: walletStore.injectiveAddress,
    subaccountId: subaccountId || accountStore.subaccountId,
    amount: {
      denom: token.denom,
      amount: denomAmountToChainDenomAmountToFixed({
        value: amount,
        decimals: token.decimals
      })
    }
  })

  const actualMessage = msgsOrMsgExecMsgs(message, walletStore.authZ.address)

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: actualMessage,
    address: walletStore.address
  })

  await backupPromiseCall(() => accountStore.fetchAccountPortfolio())
}

export const transfer = async ({
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
}) => {
  const accountStore = useAccountStore()
  const appStore = useAppStore()
  const walletStore = useWalletStore()

  if (!walletStore.isUserWalletConnected) {
    return
  }

  await appStore.queue()
  await walletStore.validate()

  const message = MsgSend.fromJSON({
    srcInjectiveAddress: walletStore.injectiveAddress,
    dstInjectiveAddress: destination,
    amount: {
      denom,
      amount: amount.toWei(token.decimals).toFixed()
    }
  })

  const actualMessage = msgsOrMsgExecMsgs(message, walletStore.authZ.address)

  await msgBroadcastClient.broadcastWithFeeDelegation({
    memo,
    msgs: actualMessage,
    address: walletStore.address
  })

  await backupPromiseCall(() => accountStore.fetchAccountPortfolio())
}

export const externalTransfer = async ({
  amount,
  denom,
  memo,
  srcSubaccountId,
  dstSubaccountId,
  token
}: {
  amount: BigNumberInBase
  denom: string
  memo?: string
  srcSubaccountId: string
  dstSubaccountId: string
  token: Token
}) => {
  const accountStore = useAccountStore()
  const appStore = useAppStore()
  const walletStore = useWalletStore()

  if (!walletStore.isUserWalletConnected) {
    return
  }

  await appStore.queue()
  await walletStore.validate()

  const message = MsgExternalTransfer.fromJSON({
    srcSubaccountId,
    dstSubaccountId,
    injectiveAddress: walletStore.injectiveAddress,
    amount: {
      denom,
      amount: amount.toWei(token.decimals).toFixed()
    }
  })

  const actualMessage = msgsOrMsgExecMsgs(message, walletStore.authZ.address)

  await msgBroadcastClient.broadcastWithFeeDelegation({
    memo,
    msgs: actualMessage,
    address: walletStore.address
  })

  await backupPromiseCall(() => accountStore.fetchAccountPortfolio())
}
