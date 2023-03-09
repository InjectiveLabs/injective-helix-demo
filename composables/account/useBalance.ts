import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { AccountBalance } from '@/types'

export function useBalance() {
  const bankStore = useBankStore()
  const tokenStore = useTokenStore()
  const walletStore = useWalletStore()

  const accountBalancesWithToken = computed(() => {
    return tokenStore.tradeableTokens.map((token) => {
      const isDefaultTradingAccount =
        walletStore.defaultSubaccountId === bankStore.subaccountId
      const denom = token.denom.toLowerCase()
      const usdPrice = tokenStore.tokenUsdPrice(token.coinGeckoId)

      const bankBalance = bankStore.balanceMap[token.denom] || 0

      const subaccountBalances =
        bankStore.subaccountBalancesMap[bankStore.subaccountId]

      const subaccountBalance = subaccountBalances.find(
        (balance) => balance.denom.toLowerCase() === denom
      )
      const subaccountAvailableBalance =
        subaccountBalance?.availableBalance || 0

      const inOrderBalance = new BigNumberInWei(
        subaccountBalance?.totalBalance || 0
      )
        .minus(subaccountAvailableBalance)
        .toFixed()

      const availableMargin = new BigNumberInWei(
        isDefaultTradingAccount ? bankBalance : subaccountAvailableBalance
      )

      const accountTotalBalance = new BigNumberInWei(bankBalance)
        .plus(isDefaultTradingAccount ? 0 : subaccountAvailableBalance)
        .plus(inOrderBalance)
      const accountTotalBalanceInUsd = accountTotalBalance.times(usdPrice)

      return {
        token,
        usdPrice,
        bankBalance,
        inOrderBalance,
        denom: token.denom,
        availableMargin: availableMargin.toFixed(),
        availableBalance: isDefaultTradingAccount
          ? 0
          : subaccountAvailableBalance,
        totalBalance: subaccountBalance?.totalBalance || 0,
        accountTotalBalance: accountTotalBalance.toFixed(),
        accountTotalBalanceInUsd: accountTotalBalanceInUsd.toFixed(),
        unrealizedPnl: '0'
      } as AccountBalance
    })
  })

  const accountBalancesWithTokenInBases = computed(() => {
    return accountBalancesWithToken.value.map((accountBalance) => {
      return {
        ...accountBalance,
        availableMargin: new BigNumberInWei(accountBalance.availableMargin)
          .toBase(accountBalance.token.decimals)
          .toFixed(),
        inOrderBalance: new BigNumberInWei(accountBalance.inOrderBalance)
          .toBase(accountBalance.token.decimals)
          .toFixed(),
        bankBalance: new BigNumberInWei(accountBalance.bankBalance)
          .toBase(accountBalance.token.decimals)
          .toFixed(),
        accountTotalBalance: new BigNumberInWei(
          accountBalance.accountTotalBalance
        )
          .toBase(accountBalance.token.decimals)
          .toFixed(),
        accountTotalBalanceInUsd: new BigNumberInWei(
          accountBalance.accountTotalBalanceInUsd
        )
          .toBase(accountBalance.token.decimals)
          .toFixed(),
        availableBalance: new BigNumberInWei(accountBalance.availableBalance)
          .toBase(accountBalance.token.decimals)
          .toFixed(),
        totalBalance: new BigNumberInWei(accountBalance.totalBalance)
          .toBase(accountBalance.token.decimals)
          .toFixed(),
        unrealizedPnl: '0'
      } as AccountBalance
    })
  })

  /**
   * A minimal representation of an AccountBalance based on the current
   * subaccountId
   *
   * @deprecated should use accountBalances instead
   */
  const balancesWithToken = computed(() => {
    return accountBalancesWithToken.value.map((accountBalance) => {
      const isDefaultTradingAccount =
        walletStore.defaultSubaccountId === bankStore.subaccountId

      return {
        token: accountBalance.token,
        denom: accountBalance.denom,
        balance: isDefaultTradingAccount
          ? accountBalance.bankBalance
          : accountBalance.availableBalance,
        usdPrice: tokenStore.tokenUsdPrice(accountBalance.token.coinGeckoId)
      }
    })
  })

  const aggregateBalanceByDenoms = ({
    balances,
    denoms
  }: {
    balances: AccountBalance[]
    denoms: string[]
  }) => {
    const filteredBalances = balances.filter((balance) =>
      denoms.includes(balance.token.denom.toLowerCase())
    )

    if (!filteredBalances.length) {
      return undefined
    }

    return filteredBalances.reduce((aggregatedBalance, balance) => {
      return {
        ...balance,
        denom: denoms.join('-'),
        bankBalance: new BigNumberInBase(aggregatedBalance.bankBalance)
          .plus(balance.bankBalance)
          .toFixed(),
        availableMargin: new BigNumberInBase(aggregatedBalance.availableMargin)
          .plus(balance.availableMargin)
          .toFixed(),
        availableBalance: new BigNumberInBase(
          aggregatedBalance.availableBalance
        )
          .plus(balance.availableBalance)
          .toFixed(),
        totalBalance: new BigNumberInBase(aggregatedBalance.totalBalance)
          .plus(balance.totalBalance)
          .toFixed(),
        inOrderBalance: new BigNumberInBase(aggregatedBalance.inOrderBalance)
          .plus(balance.inOrderBalance)
          .toFixed(),
        unrealizedPnl: new BigNumberInBase(aggregatedBalance.unrealizedPnl)
          .plus(balance.unrealizedPnl)
          .toFixed(),
        accountTotalBalance: new BigNumberInBase(
          aggregatedBalance.accountTotalBalance
        )
          .plus(balance.accountTotalBalance)
          .toFixed(),
        accountTotalBalanceInUsd: new BigNumberInBase(
          aggregatedBalance.accountTotalBalanceInUsd
        )
          .plus(balance.accountTotalBalanceInUsd)
          .toFixed()
      } as AccountBalance
    })
  }

  return {
    balancesWithToken,
    aggregateBalanceByDenoms,
    accountBalancesWithToken,
    accountBalancesWithTokenInBases
  }
}
