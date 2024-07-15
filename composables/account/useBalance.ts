import { ZERO_IN_BASE } from '@shared/utils/constant'
import { TradeDirection } from '@injectivelabs/ts-types'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { AccountBalance } from '@/types'
import { getCw20AddressFromDenom } from '@/app/utils/helpers'

const showUnverifiedAssets = ref(false)

export function useBalance() {
  const spotStore = useSpotStore()
  const tokenStore = useTokenStore()
  const accountStore = useAccountStore()
  const positionStore = usePositionStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  const aggregatedPortfolioBalances = computed(() => {
    const tokens = showUnverifiedAssets.value
      ? [
          ...new Map(
            [...tokenStore.unverifiedTokens, ...tokenStore.tradeableTokens].map(
              (token) => [token.denom, token]
            )
          ).values()
        ]
      : tokenStore.tradeableTokens

    return Object.keys(accountStore.subaccountBalancesMap).reduce(
      (balances, subaccountId) => {
        const positionsForSubaccountWithDenom = positionStore.positions.filter(
          (position) => position.subaccountId === subaccountId
        )

        return {
          ...balances,
          [subaccountId]: tokens.map((token) => {
            const isDefaultTradingAccount =
              sharedWalletStore.authZOrDefaultSubaccountId === subaccountId
            const denom = token.denom
            const usdPrice = tokenStore.tokenUsdPrice(token)

            const bankBalanceWithoutCw20 =
              accountStore.balancesMap[token.denom] || '0'

            const cw20Address = getCw20AddressFromDenom(token.denom)
            const cw20Balance = accountStore.cw20BalancesMap[cw20Address] || '0'

            const bankBalance = new BigNumberInWei(bankBalanceWithoutCw20)
              .plus(cw20Balance)
              .toFixed()

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

            const unrealizedPnlAndMargin = positionsForSubaccountWithDenom
              .filter((position) => position.denom === denom)
              .reduce((total, position) => {
                const markPriceFromMap = new BigNumberInBase(
                  derivativeStore.marketMarkPriceMap[position.marketId]
                    ?.price || 0
                ).toWei(token.decimals)
                const markPrice = new BigNumberInBase(
                  markPriceFromMap.gt(0) ? markPriceFromMap : position.markPrice
                )

                return total
                  .plus(position.margin)
                  .plus(
                    new BigNumberInWei(position.quantity)
                      .times(markPrice.minus(position.entryPrice))
                      .times(
                        position.direction === TradeDirection.Long ? 1 : -1
                      )
                  )
              }, ZERO_IN_BASE)

            const accountTotalBalance = isDefaultTradingAccount
              ? new BigNumberInWei(bankBalance)
                  .plus(subaccountTotalBalance)
                  .plus(unrealizedPnlAndMargin)
              : new BigNumberInWei(subaccountTotalBalance).plus(
                  unrealizedPnlAndMargin
                )
            const accountTotalBalanceInUsd = accountTotalBalance.times(usdPrice)

            return {
              token,
              usdPrice,
              isVerified: true,
              unrealizedPnl: unrealizedPnlAndMargin.toFixed(),
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

  const verifiedHoldingsWithToken = computed(() => {
    return tokenStore.tradeableTokens.map((token) => {
      const denom = token.denom
      const usdPrice = tokenStore.tokenUsdPrice(token)
      const isDefaultTradingAccount =
        sharedWalletStore.authZOrDefaultSubaccountId ===
        accountStore.subaccountId

      const bankBalanceWithoutCw20 =
        accountStore.balancesMap[token.denom] || '0'

      const cw20Address = getCw20AddressFromDenom(token.denom)
      const cw20Balance = accountStore.cw20BalancesMap[cw20Address] || '0'

      const bankBalance = new BigNumberInWei(bankBalanceWithoutCw20)
        .plus(cw20Balance)
        .toFixed()

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

      const positionsForSubaccountWithDenom = positionStore.positions
        .filter(
          (position) => position.subaccountId === accountStore.subaccountId
        )
        .filter((position) => position.denom === denom)

      const unrealizedPnlAndMargin = positionsForSubaccountWithDenom.reduce(
        (total, position) => {
          const markPriceFromMap = new BigNumberInBase(
            derivativeStore.marketMarkPriceMap[position.marketId]?.price || 0
          ).toWei(token.decimals)
          const markPrice = new BigNumberInBase(
            markPriceFromMap.gt(0) ? markPriceFromMap : position.markPrice
          )

          return total
            .plus(position.margin)
            .plus(
              new BigNumberInWei(position.quantity)
                .times(markPrice.minus(position.entryPrice))
                .times(position.direction === TradeDirection.Long ? 1 : -1)
            )
        },
        ZERO_IN_BASE
      )

      const accountTotalBalance = isDefaultTradingAccount
        ? new BigNumberInWei(bankBalance)
            .plus(subaccountTotalBalance)
            .plus(unrealizedPnlAndMargin)
        : new BigNumberInWei(subaccountTotalBalance).plus(
            unrealizedPnlAndMargin
          )
      const accountTotalBalanceInUsd = accountTotalBalance.times(usdPrice)

      return {
        token,
        usdPrice,
        isVerified: true,
        denom: token.denom,
        bankBalance: isDefaultTradingAccount ? bankBalance : '0',
        unrealizedPnl: unrealizedPnlAndMargin.toFixed(),
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

  const unverifiedHoldingWithTokens = computed(() => {
    if (!accountStore.isDefaultSubaccount) {
      return []
    }

    const tradeableDenoms = [
      ...new Set([
        ...spotStore.tradeableDenoms,
        ...derivativeStore.tradeableDenoms
      ])
    ]
    const unverifiedDenoms = [
      ...new Set([
        ...spotStore.unverifiedDenoms,
        ...derivativeStore.unverifiedDenoms
      ])
    ]

    return accountStore.bankBalances
      .map((coin) => {
        const shouldIgnoreCoin =
          tradeableDenoms.includes(coin.denom) ||
          !unverifiedDenoms.includes(coin.denom)

        if (shouldIgnoreCoin) {
          return undefined
        }

        const token = tokenStore.tokenByDenomOrSymbol(coin.denom)

        if (!token) {
          return undefined
        }

        const bankBalance = coin.amount
        const isDefaultTradingAccount =
          sharedWalletStore.authZOrDefaultSubaccountId ===
          accountStore.subaccountId
        const usdPrice = tokenStore.tokenUsdPrice(token)

        const subaccountBalances =
          accountStore.subaccountBalancesMap[accountStore.subaccountId]

        const subaccountBalance = (subaccountBalances || []).find(
          (balance) => balance.denom === coin.denom
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

        return {
          token,
          usdPrice,
          bankBalance,
          isVerified: false,
          denom: token.denom,
          unrealizedPnl: '0', // No perps for unverified assets so no unrealized pnl,
          inOrderBalance: inOrderBalance.toFixed(),
          availableMargin: availableMargin.toFixed(),
          availableBalance: '0', // We only care about the default subaccount,
          totalBalance: subaccountTotalBalance,
          accountTotalBalanceInUsd: new BigNumberInBase(coin.amount)
            .multipliedBy(usdPrice)
            .toFixed()
        } as AccountBalance
      })
      .filter((balance) => balance) as AccountBalance[]
  })

  const userBalancesWithToken = computed(() => [
    ...verifiedHoldingsWithToken.value,
    ...unverifiedHoldingWithTokens.value
  ])

  return {
    showUnverifiedAssets,
    userBalancesWithToken,
    verifiedHoldingsWithToken,
    aggregatedPortfolioBalances
  }
}
