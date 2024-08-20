import {
  MsgSend,
  MsgDeposit,
  MsgWithdraw,
  TokenStatic,
  MsgExternalTransfer,
  denomAmountToChainDenomAmountToFixed
} from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
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

  const messages = MsgDeposit.fromJSON({
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
  destination,
  token
}: {
  amount: BigNumberInBase
  denom: string
  memo?: string
  destination: string
  token: TokenStatic
}) => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  if (!sharedWalletStore.isUserConnected) {
    return
  }

  await walletStore.validate()

  const messages = MsgSend.fromJSON({
    srcInjectiveAddress: sharedWalletStore.authZOrInjectiveAddress,
    dstInjectiveAddress: destination,
    amount: {
      denom,
      amount: amount.toWei(token.decimals).toFixed()
    }
  })

  await sharedWalletStore.broadcastWithFeeDelegation({ messages, memo })

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
