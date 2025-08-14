import { BigNumberInBase } from '@injectivelabs/utils'
import { sharedBackupPromiseCall } from '@shared/utils/async'
import {
  MsgSend,
  MsgDeposit,
  MsgWithdraw,
  MsgExternalTransfer,
  denomAmountToChainDenomAmountToFixed
} from '@injectivelabs/sdk-ts'
import { prepareNeptuneWithdrawMessage } from '@/app/utils/msgs'
import type { TokenStatic } from '@injectivelabs/sdk-ts'

export const deposit = async ({
  amount,
  token,
  subaccountId
}: {
  token: TokenStatic
  subaccountId?: string
  amount: BigNumberInBase
}) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!accountStore.subaccountId || !sharedWalletStore.isUserConnected) {
    return
  }

  await walletStore.validate()

  const cw20Messages = prepareNeptuneWithdrawMessage({
    denom: token.denom,
    amount: denomAmountToChainDenomAmountToFixed({
      value: amount.toFixed(),
      decimals: token.decimals
    })
  })

  const message = MsgDeposit.fromJSON({
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    subaccountId: subaccountId || accountStore.subaccountId,
    amount: {
      denom: token.denom,
      amount: denomAmountToChainDenomAmountToFixed({
        value: amount.toFixed(),
        decimals: token.decimals
      })
    }
  })

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [...cw20Messages, message]
  })

  sharedBackupPromiseCall(() =>
    Promise.all([
      accountStore.fetchAccountPortfolioBalances(),
      ...(cw20Messages.length > 0 ? [accountStore.fetchCw20Balances()] : [])
    ])
  )
}

export const withdraw = async ({
  amount,
  token,
  subaccountId
}: {
  token: TokenStatic
  subaccountId?: string
  amount: BigNumberInBase
}) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!accountStore.subaccountId || !sharedWalletStore.isUserConnected) {
    return
  }

  await walletStore.validate()

  const messages = MsgWithdraw.fromJSON({
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    subaccountId: subaccountId || accountStore.subaccountId,
    amount: {
      denom: token.denom,
      amount: denomAmountToChainDenomAmountToFixed({
        value: amount.toFixed(),
        decimals: token.decimals
      })
    }
  })

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })

  await sharedBackupPromiseCall(() =>
    accountStore.fetchAccountPortfolioBalances()
  )
}

export const transfer = async ({
  amount,
  denom,
  memo,
  destination
}: {
  denom: string
  memo?: string
  amount: string
  destination: string
}) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const sharedTokenStore = useSharedTokenStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected) {
    return
  }

  const token = sharedTokenStore.tokenByDenomOrSymbol(denom) as TokenStatic

  await walletStore.validate()

  const cw20Messages = prepareNeptuneWithdrawMessage({
    denom: token.denom,
    amount: sharedToBalanceInWei({
      value: amount,
      decimalPlaces: token.decimals
    }).toFixed()
  })

  const message = MsgSend.fromJSON({
    srcInjectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    dstInjectiveAddress: destination,
    amount: {
      denom,
      amount: sharedToBalanceInWei({
        value: amount,
        decimalPlaces: token.decimals
      }).toFixed()
    }
  })

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [...cw20Messages, message],
    memo
  })

  sharedBackupPromiseCall(() =>
    Promise.all([
      accountStore.fetchAccountPortfolioBalances(),
      ...(cw20Messages.length > 0 ? [accountStore.fetchCw20Balances()] : [])
    ])
  )
}

export const externalTransfer = async ({
  amount,
  denom,
  memo,
  srcSubaccountId,
  dstSubaccountId,
  token
}: {
  denom: string
  memo?: string
  token: TokenStatic
  amount: BigNumberInBase
  srcSubaccountId: string
  dstSubaccountId: string
}) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected) {
    return
  }

  await walletStore.validate()

  const messages = MsgExternalTransfer.fromJSON({
    srcSubaccountId,
    dstSubaccountId,
    injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    amount: {
      denom,
      amount: amount.toWei(token.decimals).toFixed()
    }
  })

  await sharedWalletStore.broadcastWithFeeDelegation({ messages, memo })

  await sharedBackupPromiseCall(() =>
    accountStore.fetchAccountPortfolioBalances()
  )
}

export const withdrawToMain = async () => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!accountStore.subaccountId || !sharedWalletStore.isUserConnected) {
    return
  }

  await walletStore.validate()

  const messages = accountStore.subaccountBalancesMap[accountStore.subaccountId]
    .filter((balance) =>
      new BigNumberInBase(balance.availableBalance)
        .dp(0, BigNumberInBase.ROUND_DOWN)
        .gt(0)
    )
    .map((balance) =>
      MsgWithdraw.fromJSON({
        injectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
        subaccountId: accountStore.subaccountId,
        amount: {
          amount: new BigNumberInBase(balance.availableBalance).toFixed(
            0,
            BigNumberInBase.ROUND_DOWN
          ),
          denom: balance.denom
        }
      })
    )

  await sharedWalletStore.broadcastWithFeeDelegation({ messages })

  await sharedBackupPromiseCall(() =>
    accountStore.fetchAccountPortfolioBalances()
  )
}
