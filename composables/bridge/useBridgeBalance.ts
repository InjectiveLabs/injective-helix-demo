import { BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInWei } from '@injectivelabs/utils'
import { Token } from '@injectivelabs/token-metadata'
import {
  BalanceWithToken,
  BridgeField,
  BridgeType,
  TransferDirection
} from '@/types'

export function useBridgeBalance() {
  const state = useBridgeState()
  const accountStore = useAccountStore()
  const bankStore = useBankStore()
  const tokenStore = useTokenStore()

  const erc20Balances = computed(() => {
    const balances = tokenStore.erc20TokensWithBalanceAndPriceFromBank.map(
      (token) => {
        const balance = new BigNumberInWei(token.balance)
          .toBase(token.decimals)
          .toString()

        return {
          token: token as Token,
          denom: token.denom,
          balance: token.balance,
          balanceToBase: balance
        } as BalanceWithToken
      }
    )

    return balances
  })

  const bankBalances = computed(() => {
    const balances = bankStore.bankBalancesWithToken
      .filter((token) => !token.denom.startsWith('share'))
      .map((tokenWithBalance) => {
        const balance = new BigNumberInWei(tokenWithBalance.balance || 0)
          .toBase(tokenWithBalance.token.decimals)
          .toString()

        return {
          ...tokenWithBalance,
          balanceToBase: balance
        } as BalanceWithToken
      })

    return balances
  })

  const accountBalances = computed(() => {
    if (!accountStore.subaccount) {
      return []
    }

    const balances = accountStore.subaccount.balances
      .map((subaccountBalance) => {
        const token = tokenStore.tokens.find(
          (token) => token.denom === subaccountBalance.denom
        )

        return {
          token,
          denom: subaccountBalance.denom,
          balance: subaccountBalance.availableBalance,
          balanceToBase: new BigNumberInWei(subaccountBalance.availableBalance)
            .toBase(token?.decimals)
            .toFixed()
        }
      })
      .filter((balance) => balance.token) as BalanceWithToken[]

    return balances
  })

  const balancesWithToken = computed<BalanceWithToken[]>(() => {
    if (state.bridgeType.value === BridgeType.Deposit) {
      return erc20Balances.value
    }

    if (state.bridgeType.value === BridgeType.Withdraw) {
      const destinationIsEthereum =
        state.form[BridgeField.BridgingNetwork] === BridgingNetwork.Ethereum

      if (destinationIsEthereum) {
        return bankBalances.value.filter(
          (balance) => balance.token.erc20Address
        )
      }

      return bankBalances.value
    }

    return state.form[BridgeField.TransferDirection] ===
      TransferDirection.bankToTradingAccount
      ? bankBalances.value
      : accountBalances.value
  })

  return {
    transferableBalancesWithToken: balancesWithToken
  }
}
