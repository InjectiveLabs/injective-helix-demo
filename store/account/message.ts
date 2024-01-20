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
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    subaccountId: subaccountId || accountStore.subaccountId,
    amount: {
      denom: token.denom,
      amount: denomAmountToChainDenomAmountToFixed({
        value: amount,
        decimals: token.decimals
      })
    }
  })

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
  })

  await backupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
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
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    subaccountId: subaccountId || accountStore.subaccountId,
    amount: {
      denom: token.denom,
      amount: denomAmountToChainDenomAmountToFixed({
        value: amount,
        decimals: token.decimals
      })
    }
  })

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
  })

  await backupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
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
    srcInjectiveAddress: walletStore.authZOrInjectiveAddress,
    dstInjectiveAddress: destination,
    amount: {
      denom,
      amount: amount.toWei(token.decimals).toFixed()
    }
  })

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  await msgBroadcastClient.broadcastWithFeeDelegation({
    memo,
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
  })

  await backupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
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
    injectiveAddress: walletStore.authZOrInjectiveAddress,
    amount: {
      denom,
      amount: amount.toWei(token.decimals).toFixed()
    }
  })

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(message, walletStore.injectiveAddress)
    : message

  await msgBroadcastClient.broadcastWithFeeDelegation({
    memo,
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
  })

  await backupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
}

export const withdrawToMain = async () => {
  const appStore = useAppStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()

  if (!accountStore.subaccountId || !walletStore.isUserWalletConnected) {
    return
  }

  await appStore.queue()
  await walletStore.validate()

  const msgs = accountStore.subaccountBalancesMap[
    accountStore.subaccountId
  ].map((balance) =>
    MsgWithdraw.fromJSON({
      injectiveAddress: walletStore.authZOrInjectiveAddress,
      subaccountId: accountStore.subaccountId,
      amount: {
        amount: new BigNumberInBase(balance.availableBalance).toFixed(0),
        denom: balance.denom
      }
    })
  )

  const actualMessage = walletStore.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(msgs, walletStore.injectiveAddress)
    : msgs

  await msgBroadcastClient.broadcastWithFeeDelegation({
    msgs: actualMessage,
    injectiveAddress: walletStore.injectiveAddress
  })

  await backupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
}
