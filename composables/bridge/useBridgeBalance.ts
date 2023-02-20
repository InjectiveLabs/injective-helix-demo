import type { Ref } from 'vue'
import { BalanceWithToken, BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { Erc20Token } from '@injectivelabs/token-metadata'
import { BridgeForm, BridgeType, TransferDirection, BridgeField } from '@/types'

/**
 * For the bridge balances, we only use
 * the tradeable tokens that we have on the DEX
 */
export function useBridgeBalance({
  formValues
}: {
  formValues: Ref<Partial<BridgeForm>>
}) {
  const accountStore = useAccountStore()
  const bankStore = useBankStore()
  const tokenStore = useTokenStore()
  const peggyStore = usePeggyStore()

  const erc20Balances = computed(() =>
    peggyStore.tradeableErc20BalancesWithTokenAndPrice.map((balance) => {
      return {
        ...balance,
        balance: balance.erc20Balance.balance
      } as BalanceWithToken
    })
  )

  const bankBalances = computed(() =>
    tokenStore.tradeableTokens.map((token) => {
      const balanceWithToken = bankStore.bankBalancesWithToken.find(
        (balance) => balance.denom === token.denom
      )

      return {
        token,
        denom: token.denom,
        balance: balanceWithToken?.balance || '0'
      } as BalanceWithToken
    })
  )

  const accountBalances = computed(
    () =>
      tokenStore.tradeableTokens
        .map((token) => {
          const accountBalance = accountStore.subaccount?.balances.find(
            (balance) => balance.denom === token.denom
          )

          return {
            token,
            denom: token.denom,
            balance: accountBalance?.availableBalance || '0'
          }
        })
        .filter((balance) => balance.token) as BalanceWithToken[]
  )

  const balancesWithToken = computed<BalanceWithToken[]>(() => {
    if (formValues.value[BridgeField.BridgeType] === BridgeType.Deposit) {
      return erc20Balances.value
    }

    if (formValues.value[BridgeField.BridgeType] === BridgeType.Withdraw) {
      const destinationIsEthereum =
        formValues.value[BridgeField.BridgingNetwork] ===
        BridgingNetwork.Ethereum

      if (destinationIsEthereum) {
        return bankBalances.value.filter(
          (balance) => (balance.token as Erc20Token).erc20?.address
        )
      }

      return bankBalances.value
    }

    return formValues.value[BridgeField.TransferDirection] ===
      TransferDirection.bankToTradingAccount
      ? bankBalances.value
      : accountBalances.value
  })

  return {
    transferableBalancesWithToken: balancesWithToken
  }
}
