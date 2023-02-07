import { BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInWei } from '@injectivelabs/utils'
import { Token } from '@injectivelabs/token-metadata'
import {
  BalanceWithToken,
  BridgeField,
  BridgeType,
  TransferDirection
} from '@/types'

/**
 * For the bridge balances, we only use
 * the tradeable tokens that we have on the DEX
 */
export function useBridgeBalance() {
  const state = useBridgeState()
  const accountStore = useAccountStore()
  const bankStore = useBankStore()
  const tokenStore = useTokenStore()

  const erc20Balances = computed(() => {
    const balances = tokenStore.tradeableErc20TokensWithBalanceAndPrice.map(
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
    const balances = tokenStore.tradeableTokens.map((token) => {
      const balanceWithToken = bankStore.bankBalancesWithToken.find(
        (balance) => balance.denom === token.denom
      )

      return {
        token,
        denom: token.denom,
        balance: balanceWithToken?.balance || '0',
        balanceToBase: new BigNumberInWei(balanceWithToken?.balance || 0)
          .toBase(token.decimals)
          .toFixed()
      } as BalanceWithToken
    })

    return balances
  })

  const accountBalances = computed(() => {
    const balances = tokenStore.tradeableTokens
      .map((token) => {
        const accountBalance = accountStore.subaccount?.balances.find(
          (balance) => balance.denom === token.denom
        )

        return {
          token,
          denom: token.denom,
          balance: accountBalance?.availableBalance || '0',
          balanceToBase: new BigNumberInWei(
            accountBalance?.availableBalance || '0'
          )
            .toBase(token.decimals)
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
