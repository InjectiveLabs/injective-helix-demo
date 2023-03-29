import type { Ref } from 'vue'
import {
  BalanceWithToken,
  BalanceWithTokenAndPrice,
  BridgingNetwork
} from '@injectivelabs/sdk-ui-ts'
import type { Erc20Token } from '@injectivelabs/token-metadata'
import { BridgeForm, BridgeType, BridgeField } from '@/types'
import { isTokenWormholeToken } from '@/app/data/bridge'

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
  const accountStore = useAccountStore()

  const bankBalancesWithToken = computed(() => {
    return accountStore.bankBalances
      .map((bankBalance) => {
        const token = tokenStore.tradeableTokens.find(
          (token) => token.denom === bankBalance.denom
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
      return erc20Balances.value.filter(
        // We need to filter out Wormhole ERC20 transfers for the Peggy Bridge
        (erc20Balance) => !isTokenWormholeToken(erc20Balance.token)
      )
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
