import type { Ref } from 'vue'
import { BalanceWithToken, BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { Erc20Token } from '@injectivelabs/token-metadata'
import { BridgeForm, BridgeType, BridgeField } from '@/types'

/**
 * For the bridge balances, we only use
 * the tradeable tokens that we have on the DEX
 */
export function useBridgeBalance({
  formValues,
  balancesWithToken
}: {
  formValues: Ref<Partial<BridgeForm>>
  balancesWithToken: Ref<BalanceWithToken[]>
}) {
  const peggyStore = usePeggyStore()

  const erc20Balances = computed(() =>
    peggyStore.tradeableErc20BalancesWithTokenAndPrice.map((balance) => {
      return {
        ...balance,
        balance: balance.erc20Balance.balance
      } as BalanceWithToken
    })
  )

  const transferableBalancesWithToken = computed<BalanceWithToken[]>(() => {
    if (formValues.value[BridgeField.BridgeType] === BridgeType.Deposit) {
      return erc20Balances.value
    }

    const destinationIsEthereum =
      formValues.value[BridgeField.BridgingNetwork] === BridgingNetwork.Ethereum

    if (destinationIsEthereum) {
      return balancesWithToken.value.filter(
        (balance) => (balance.token as Erc20Token).erc20?.address
      )
    }

    return balancesWithToken.value
  })

  return {
    transferableBalancesWithToken
  }
}
