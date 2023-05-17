import { BalanceWithTokenAndPrice } from '@injectivelabs/sdk-ui-ts'
import { SubaccountTransferField, SubaccountTransferForm } from '~/types'

export function useSubaccountTransferBalance(
  formValues: Ref<Partial<SubaccountTransferForm>>
) {
  const tokenStore = useTokenStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()

  const subaccountBalance = computed(() => {
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
        const isDefaultSubaccount =
          formValues.value[SubaccountTransferField.SrcSubaccountId] ===
          walletStore.defaultSubaccountId

        if (!isDefaultSubaccount) {
          return {
            token,
            denom: balance.denom,
            balance: balance.availableBalance,
            usdPrice: 0
          }
        }

        const bankBalance = accountStore.bankBalances.find(
          (bankBalance) => bankBalance.denom === balance.denom
        )?.amount

        return {
          token,
          denom: balance.denom,
          balance: bankBalance || '0',
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
