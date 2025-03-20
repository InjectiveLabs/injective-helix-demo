import {
  MsgSend,
  MsgDeposit,
  MsgWithdraw,
  TokenStatic,
  MsgExternalTransfer,
  denomAmountToChainDenomAmountToFixed
} from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { prepareOrderMessages } from '@/app/utils/market'
import { backupPromiseCall } from '@/app/utils/async'

export const deposit = async ({
  amount,
  token,
  subaccountId
}: {
  amount: BigNumberInBase
  token: TokenStatic
  subaccountId?: string
}) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!accountStore.subaccountId || !sharedWalletStore.isUserConnected) {
    return
  }

  await walletStore.validate()

  const cw20ConvertMessage = prepareOrderMessages({
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
    messages: [...cw20ConvertMessage, message]
  })

  backupPromiseCall(() =>
    Promise.all([
      accountStore.fetchCw20Balances(),
      accountStore.fetchAccountPortfolioBalances()
    ])
  )
}

export const withdraw = async ({
  amount,
  token,
  subaccountId
}: {
  amount: BigNumberInBase
  token: TokenStatic
  subaccountId?: string
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

  await backupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
}

export const transfer = async ({
  amount,
  denom,
  memo,
  destination
}: {
  amount: string
  denom: string
  memo?: string
  destination: string
}) => {
  const tokenStore = useTokenStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected) {
    return
  }

  const token = tokenStore.tokenByDenomOrSymbol(denom) as TokenStatic

  await walletStore.validate()

  const cw20ConvertMessage = prepareOrderMessages({
    denom: token.denom,
    amount: new BigNumberInBase(amount).toWei(token.decimals).toFixed()
  })

  const message = MsgSend.fromJSON({
    srcInjectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    dstInjectiveAddress: destination,
    amount: {
      denom,
      amount: new BigNumberInBase(amount).toWei(token.decimals).toFixed()
    }
  })

  await sharedWalletStore.broadcastWithFeeDelegation({
    messages: [...cw20ConvertMessage, message],
    memo
  })

  backupPromiseCall(() =>
    Promise.all([
      accountStore.fetchCw20Balances(),
      accountStore.fetchAccountPortfolioBalances()
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
  amount: BigNumberInBase
  denom: string
  memo?: string
  srcSubaccountId: string
  dstSubaccountId: string
  token: TokenStatic
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

  await backupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
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

  await backupPromiseCall(() => accountStore.fetchAccountPortfolioBalances())
}
