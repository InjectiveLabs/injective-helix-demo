import { injToken } from '@shared/data/token'
import { SharedBalanceWithTokenAndPrice } from '@shared/types'
import { SubaccountTransferField, SubaccountTransferForm } from '@/types'

export function useSubaccountTransferBalance(
  formValues: Ref<SubaccountTransferForm>
) {
  const tokenStore = useTokenStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()

  const subaccountBalance = computed(() => {
    const isDefaultSubaccount =
      formValues.value[SubaccountTransferField.SrcSubaccountId] ===
      walletStore.defaultSubaccountId

    if (isDefaultSubaccount) {
      return accountStore.bankBalances.map((bankBalance) => {
        return {
          denom: bankBalance.denom,
          availableBalance: bankBalance.amount,
          totalBalance: '0'
        }
      })
    }

    return (
      accountStore.subaccountBalancesMap[
        formValues.value[SubaccountTransferField.SrcSubaccountId]
      ] || []
    )
  })

  const supplyWithBalance = computed(() => {
    const supplyWithBalance = subaccountBalance.value
      .map((balance) => {
        const token = tokenStore.tradeableTokens.find(
          (token) => token.denom === balance.denom
        )

        return {
          token,
          denom: balance.denom,
          balance: balance.availableBalance,
          usdPrice: 0
        }
      })
      .filter(
        (balanceWithToken) => balanceWithToken.token
      ) as SharedBalanceWithTokenAndPrice[]

    const hasInjBalance = supplyWithBalance.find(
      (balance) => balance.denom === injToken.denom
    )

    return hasInjBalance
      ? supplyWithBalance
      : [
          { token: injToken, denom: injToken.denom, balance: '0', usdPrice: 0 },
          ...supplyWithBalance
        ]
  })

  return {
    supplyWithBalance
  }
}
