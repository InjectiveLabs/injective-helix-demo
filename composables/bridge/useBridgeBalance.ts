import type { Ref } from 'vue'
import {
  BalanceWithToken,
  BalanceWithTokenAndPrice,
  BridgingNetwork
} from '@injectivelabs/sdk-ui-ts'
import { Erc20Token } from '@injectivelabs/token-metadata'
import { BridgeForm, BridgeType, BridgeField } from '@/types'

/**
 * For the bridge balances, we only use
 * the tradeable tokens that we have on the DEX
 */
export function useBridgeBalance({
  formValues
}: {
  formValues: Ref<Partial<BridgeForm>>
}) {
  const tokenStore = useTokenStore()
  const peggyStore = usePeggyStore()
  const bankStore = useBankStore()

  const bankBalancesWithToken = computed(() => {
    return bankStore.bankBalances
      .map((bankBalance) => {
        const token = tokenStore.tradeableTokens.find(
          (token) =>
            token.denom.toLowerCase() === bankBalance.denom.toLowerCase()
        )

        return {
          token,
          denom: bankBalance.denom,
          balance: bankBalance.amount,
          usdPrice: tokenStore.tokenUsdPrice(token?.coinGeckoId || '')
        }
      })
      .filter(
        (balanceWithToken) => balanceWithToken.token
      ) as BalanceWithTokenAndPrice[]
  })

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
      return bankBalancesWithToken.value.filter(
        (balance) => (balance.token as Erc20Token).erc20?.address
      )
    }

    return bankBalancesWithToken.value
  })

  return {
    transferableBalancesWithToken
  }
}
