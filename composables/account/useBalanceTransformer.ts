import { injToken } from '@shared/data/token'
import { Wallet } from '@injectivelabs/wallet-ts'
import { INJ_DENOM, BigNumberInBase } from '@injectivelabs/utils'
import { TokenType, TokenVerification } from '@injectivelabs/sdk-ts'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { AccountBalance, BalanceTableColumn } from '@/types'

export function useBalanceTransformer(balances: Ref<AccountBalance[]>) {
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  const rows = computed(() => {
    const sortedBalances = balances.value.sort((a, b) => {
      const aBalanceInToken = sharedToBalanceInTokenInBase({
        value: a.totalBalanceInUsd,
        decimalPlaces: a.token.decimals
      })

      const bBalanceInToken = sharedToBalanceInTokenInBase({
        value: b.totalBalanceInUsd,
        decimalPlaces: b.token.decimals
      })

      if (b.token.denom === INJ_DENOM) {
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
        ? sharedWalletStore.wallet !== Wallet.Magic && !isBridgable
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
        isVerified: balance.isVerified,
        [BalanceTableColumn.Total]: totalAmount.toFixed(
          UI_DEFAULT_DISPLAY_DECIMALS,
          BigNumberInBase.ROUND_DOWN
        ),
        [BalanceTableColumn.Available]: availableAmount.eq(0)
          ? ''
          : availableAmount.toFixed(
              UI_DEFAULT_DISPLAY_DECIMALS,
              BigNumberInBase.ROUND_DOWN
            ),
        [BalanceTableColumn.UnrealizedPnl]: unrealizedPnl.eq(0)
          ? ''
          : unrealizedPnl.toFixed(
              UI_DEFAULT_DISPLAY_DECIMALS,
              BigNumberInBase.ROUND_DOWN
            ),
        [BalanceTableColumn.UsedOrReserved]: usedOrReserved.eq(0)
          ? ''
          : usedOrReserved.toFixed(
              UI_DEFAULT_DISPLAY_DECIMALS,
              BigNumberInBase.ROUND_DOWN
            ),
        [BalanceTableColumn.TotalUsd]: new BigNumberInBase(
          totalAmountInUsd
        ).toFixed(UI_DEFAULT_DISPLAY_DECIMALS, BigNumberInBase.ROUND_DOWN)
      }
    })
  })

  return {
    rows
  }
}
