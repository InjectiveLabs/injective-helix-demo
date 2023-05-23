import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { usePositionWithDenom } from '../exchange/usePosition'
import { AccountBalance } from '@/types'

const reduceAccountBalances = (
  accountBalance1: AccountBalance,
  accountBalance2: AccountBalance
) => {
  return {
    ...accountBalance1,
    bankBalance: new BigNumberInBase(accountBalance1.bankBalance)
      .plus(accountBalance2.bankBalance)
      .toFixed(),
    availableMargin: new BigNumberInBase(accountBalance1.availableMargin)
      .plus(accountBalance2.availableMargin)
      .toFixed(),
    availableBalance: new BigNumberInBase(accountBalance1.availableBalance)
      .plus(accountBalance2.availableBalance)
      .toFixed(),
    totalBalance: new BigNumberInBase(accountBalance1.totalBalance)
      .plus(accountBalance2.totalBalance)
      .toFixed(),
    inOrderBalance: new BigNumberInBase(accountBalance1.inOrderBalance)
      .plus(accountBalance2.inOrderBalance)
      .toFixed(),
    unrealizedPnl: new BigNumberInBase(accountBalance1.unrealizedPnl)
      .plus(accountBalance2.unrealizedPnl)
      .toFixed(),
    accountTotalBalance: new BigNumberInBase(
      accountBalance1.accountTotalBalance
    )
      .plus(accountBalance2.accountTotalBalance)
      .toFixed(),
    accountTotalBalanceInUsd: new BigNumberInBase(
      accountBalance1.accountTotalBalanceInUsd
    )
      .plus(accountBalance2.accountTotalBalanceInUsd)
      .toFixed()
  } as AccountBalance
}

export function useBalance() {
  const accountStore = useAccountStore()
  const tokenStore = useTokenStore()
  const walletStore = useWalletStore()

  const aggregatedPortfolioBalances = computed(() => {
    return Object.keys(accountStore.subaccountBalancesMap).reduce(
      (balances, subaccountId) => {
        const positionsForSubaccountWithDenom = accountStore.positionsWithUpnl
          .filter(
            (position) => position.position?.subaccountId === subaccountId
          )
          .map(usePositionWithDenom)
          .filter((position) => position.denom)

        return {
          ...balances,
          [subaccountId]: tokenStore.tradeableTokens.map((token) => {
            const isDefaultTradingAccount =
              walletStore.defaultSubaccountId === subaccountId
            const denom = token.denom
            const usdPrice = tokenStore.tokenUsdPrice(token.coinGeckoId)

            const bankBalance = accountStore.balanceMap[token.denom] || '0'

            const subaccountBalances =
              accountStore.subaccountBalancesMap[subaccountId]

            const subaccountBalance = (subaccountBalances || []).find(
              (balance) => balance.denom === denom
            )
            const subaccountAvailableBalance =
              subaccountBalance?.availableBalance || '0'
            const subaccountTotalBalance =
              subaccountBalance?.totalBalance || '0'

            const inOrderBalance = isDefaultTradingAccount
              ? new BigNumberInWei(subaccountTotalBalance)
              : new BigNumberInWei(subaccountTotalBalance).minus(
                  subaccountAvailableBalance
                )
            const availableMargin = new BigNumberInWei(
              isDefaultTradingAccount ? bankBalance : subaccountAvailableBalance
            )

            const positionWithPnlAndDenom =
              positionsForSubaccountWithDenom.filter(
                (position) => position.denom === denom
              )
            const unrealizedPnl = positionWithPnlAndDenom.reduce(
              (total, position) =>
                total.plus(
                  new BigNumberInWei(position?.unrealizedPnl || '0').plus(
                    position?.position?.margin || '0'
                  )
                ),
              ZERO_IN_BASE
            )

            const accountTotalBalance = isDefaultTradingAccount
              ? new BigNumberInWei(bankBalance)
                  .plus(subaccountTotalBalance)
                  .plus(unrealizedPnl)
              : new BigNumberInWei(subaccountTotalBalance).plus(unrealizedPnl)
            const accountTotalBalanceInUsd = accountTotalBalance.times(usdPrice)

            return {
              token,
              usdPrice,
              unrealizedPnl: unrealizedPnl.toFixed(),
              denom: token.denom,
              bankBalance: isDefaultTradingAccount ? bankBalance : '0',
              inOrderBalance: inOrderBalance.toFixed(),
              availableMargin: availableMargin.toFixed(),
              availableBalance: isDefaultTradingAccount
                ? '0'
                : subaccountAvailableBalance,
              totalBalance: subaccountTotalBalance,
              accountTotalBalance: accountTotalBalance.toFixed(),
              accountTotalBalanceInUsd: accountTotalBalanceInUsd.toFixed()
            } as AccountBalance
          })
        }
      },
      {} as Record<string, AccountBalance[]>
    )
  })

  const accountBalancesWithToken = computed(() => {
    return tokenStore.tradeableTokens.map((token) => {
      const isDefaultTradingAccount =
        walletStore.defaultSubaccountId === accountStore.subaccountId
      const denom = token.denom
      const usdPrice = tokenStore.tokenUsdPrice(token.coinGeckoId)

      const bankBalance = accountStore.balanceMap[token.denom] || '0'

      const subaccountBalances =
        accountStore.subaccountBalancesMap[accountStore.subaccountId]

      const subaccountBalance = (subaccountBalances || []).find(
        (balance) => balance.denom === denom
      )
      const subaccountAvailableBalance =
        subaccountBalance?.availableBalance || '0'
      const subaccountTotalBalance = subaccountBalance?.totalBalance || '0'

      const inOrderBalance = isDefaultTradingAccount
        ? new BigNumberInWei(subaccountTotalBalance)
        : new BigNumberInWei(subaccountTotalBalance).minus(
            subaccountAvailableBalance
          )
      const availableMargin = new BigNumberInWei(
        isDefaultTradingAccount ? bankBalance : subaccountAvailableBalance
      )

      const positionsForSubaccountWithDenom = accountStore.positionsWithUpnl
        .filter(
          (position) =>
            position.position?.subaccountId === accountStore.subaccountId
        )
        .map(usePositionWithDenom)
        .filter((position) => position.denom)
      const positionWithPnlAndDenom = positionsForSubaccountWithDenom.filter(
        (position) => position.denom === denom
      )
      const unrealizedPnl = positionWithPnlAndDenom.reduce(
        (total, position) =>
          total.plus(
            new BigNumberInWei(position?.unrealizedPnl || '0').plus(
              position?.position?.margin || '0'
            )
          ),
        ZERO_IN_BASE
      )

      const accountTotalBalance = isDefaultTradingAccount
        ? new BigNumberInWei(bankBalance)
            .plus(subaccountTotalBalance)
            .plus(unrealizedPnl)
        : new BigNumberInWei(subaccountTotalBalance).plus(unrealizedPnl)
      const accountTotalBalanceInUsd = accountTotalBalance.times(usdPrice)

      return {
        token,
        usdPrice,
        denom: token.denom,
        bankBalance: isDefaultTradingAccount ? bankBalance : '0',
        unrealizedPnl: unrealizedPnl.toFixed(),
        inOrderBalance: inOrderBalance.toFixed(),
        availableMargin: availableMargin.toFixed(),
        availableBalance: isDefaultTradingAccount
          ? '0'
          : subaccountAvailableBalance,
        totalBalance: subaccountTotalBalance,
        accountTotalBalance: accountTotalBalance.toFixed(),
        accountTotalBalanceInUsd: accountTotalBalanceInUsd.toFixed()
      } as AccountBalance
    })
  })

  const getAccountBalancesWithTokenInBases = (
    accountBalancesWithToken: Ref<AccountBalance[]>
  ) => {
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
        unrealizedPnl: new BigNumberInWei(accountBalance.unrealizedPnl)
          .toBase(accountBalance.token.decimals)
          .toFixed()
      } as AccountBalance
    })
  }

  /**
   * A minimal representation of an AccountBalance based on the current
   * subaccountId
   *
   * @deprecated should use accountBalances instead
   */
  const balancesWithToken = computed(() => {
    return accountBalancesWithToken.value.map((accountBalance) => {
      const isDefaultTradingAccount =
        walletStore.defaultSubaccountId === accountStore.subaccountId

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
      denoms.includes(balance.token.denom)
    )

    if (!filteredBalances.length) {
      return undefined
    }

    return filteredBalances.reduce((aggregatedBalance, balance) => {
      return {
        ...balance,
        ...reduceAccountBalances(aggregatedBalance, balance),
        denom: denoms.join('-')
      } as AccountBalance
    })
  }

  return {
    balancesWithToken,
    aggregateBalanceByDenoms,
    accountBalancesWithToken,
    aggregatedPortfolioBalances,
    getAccountBalancesWithTokenInBases
  }
}
