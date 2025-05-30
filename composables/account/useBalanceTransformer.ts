import { injToken } from '@shared/data/token'
import { Wallet } from '@injectivelabs/wallet-base'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { INJ_DENOM, BigNumberInBase } from '@injectivelabs/utils'
import { TokenType, TokenVerification } from '@injectivelabs/sdk-ts'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import { BalanceTableColumn } from '@/types'
import type { AccountBalance } from '@/types'

export function useBalanceTransformer(balances: Ref<AccountBalance[]>) {
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  const rows = computed(() => {
    const sortedBalances = balances.value.sort((a, b) => {
      const aBalanceInToken = new BigNumberInBase(a.totalBalanceInUsd)
      const bBalanceInToken = new BigNumberInBase(b.totalBalanceInUsd)

      const aBalanceIsInj = a.token.denom === INJ_DENOM
      const bBalanceIsInj = b.token.denom === INJ_DENOM

      if (aBalanceIsInj && !bBalanceIsInj) {
        return -1
      }

      if (bBalanceIsInj && !aBalanceIsInj) {
        return 1
      }

      return aBalanceInToken.gt(bBalanceInToken) ? -1 : 1
    })

    return sortedBalances.map((balance) => {
      const isInjDenom = balance.token.denom === injToken.denom

      const isVerifiedIbcToken =
        balance.token.tokenType === TokenType.Ibc && balance.isVerified

      const isVerifiedErc20Token =
        balance.token.tokenType === TokenType.Erc20 &&
        balance.token.tokenVerification === TokenVerification.Verified

      const isBridgable =
        isInjDenom || isVerifiedIbcToken || isVerifiedErc20Token

      const hasNoActionButtons = accountStore.isDefaultSubaccount
        ? [Wallet.Magic, Wallet.Turnkey].includes(sharedWalletStore.wallet) &&
          !isBridgable
        : accountStore.isSgtSubaccount

      const availableAmount = sharedToBalanceInTokenInBase({
        value: balance.availableBalance,
        decimalPlaces: balance.token.decimals
      })

      const totalAmount = sharedToBalanceInTokenInBase({
        value: balance.totalBalance,
        decimalPlaces: balance.token.decimals
      })

      const totalAmountInUsd = balance.totalBalanceInUsd

      const usedOrReserved = sharedToBalanceInTokenInBase({
        value: balance.inOrderBalance,
        decimalPlaces: balance.token.decimals
      })

      const unrealizedPnl = sharedToBalanceInTokenInBase({
        value: balance.unrealizedPnl,
        decimalPlaces: balance.token.decimals
      })

      return {
        isBridgable,
        hasNoActionButtons,
        isStakingRow: false,
        token: balance.token,
        [BalanceTableColumn.Total]: totalAmount,
        [BalanceTableColumn.Available]: availableAmount.eq(0)
          ? ZERO_IN_BASE
          : availableAmount,
        [BalanceTableColumn.UnrealizedPnl]: unrealizedPnl.eq(0)
          ? ZERO_IN_BASE
          : unrealizedPnl,
        [BalanceTableColumn.UsedOrReserved]: usedOrReserved.eq(0)
          ? ZERO_IN_BASE
          : usedOrReserved,
        isVerified:
          balance.token.tokenVerification === TokenVerification.Verified,
        [BalanceTableColumn.TotalUsd]: new BigNumberInBase(totalAmountInUsd)
      }
    })
  })

  return {
    rows
  }
}
