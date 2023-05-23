import { BalanceWithTokenAndPrice } from '@injectivelabs/sdk-ui-ts'
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
    return subaccountBalance.value
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
      ) as BalanceWithTokenAndPrice[]
  })

  return {
    supplyWithBalance
  }
}
