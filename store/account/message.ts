import {
  MsgSend,
  MsgDeposit,
  MsgWithdraw,
  denomAmountToChainDenomAmountToFixed
} from '@injectivelabs/sdk-ts'
import type { Token } from '@injectivelabs/token-metadata'
import { BigNumberInBase } from '@injectivelabs/utils'
import { msgBroadcastClient } from '@/app/Services'

export const deposit = async ({
  amount,
  token
}: {
  amount: BigNumberInBase
  token: Token
}) => {
  const accountStore = useAccountStore()
  const { queue } = useAppStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()

  if (!accountStore.subaccountId || !isUserWalletConnected) {
    return
  }

  await queue()
  await validate()

  const message = MsgDeposit.fromJSON({
    injectiveAddress,
    subaccountId: accountStore.subaccountId,
    amount: {
      denom: token.denom,
      amount: denomAmountToChainDenomAmountToFixed({
        value: amount,
        decimals: token.decimals
      })
    }
  })

  await msgBroadcastClient.broadcastOld({
    msgs: message,
    address
  })
}

export const withdraw = async ({
  amount,
  token
}: {
  amount: BigNumberInBase
  token: Token
}) => {
  const accountStore = useAccountStore()
  const { queue } = useAppStore()
  const { address, injectiveAddress, isUserWalletConnected, validate } =
    useWalletStore()

  if (!accountStore.subaccountId || !isUserWalletConnected) {
    return
  }

  await queue()
  await validate()

  const message = MsgWithdraw.fromJSON({
    injectiveAddress,
    subaccountId: accountStore.subaccountId,
    amount: {
      denom: token.denom,
      amount: denomAmountToChainDenomAmountToFixed({
        value: amount,
        decimals: token.decimals
      })
    }
  })

  await msgBroadcastClient.broadcastOld({
    msgs: message,
    address
  })
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
}
