import { PositionV2 } from '@injectivelabs/sdk-ts'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { injToken, usdtToken } from '@shared/data/token'
import { TradeDirection } from '@injectivelabs/ts-types'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import { getCw20AddressFromDenom } from '@/app/utils/helpers'
import {
  AccountBalance,
  SubaccountBalance,
  SubaccountBalanceWithInOrder
} from '@/types'

const showUnverifiedAssets = ref(false)

// to do move subaccount transforming functions to layer sharedBalanceStore
function calculateSubaccountBalance(
  balance: SubaccountBalance[]
): SubaccountBalanceWithInOrder[] {
  return balance.map((balance) => ({
    ...balance,
    inOrderBalance: new BigNumberInBase(balance.totalBalance)
      .minus(balance.availableBalance)
      .toFixed()
  }))
}

// combines subaccount0 + bank + cw20 balance
function calculateDefaultSubaccountBalance(
  balances: SubaccountBalance[]
): SubaccountBalanceWithInOrder[] {
  const spotStore = useSpotStore()
  const accountStore = useAccountStore()
  const derivativeStore = useDerivativeStore()

  const tradeableDenoms = [
    ...new Set([
      ...spotStore.tradeableDenoms,
      ...derivativeStore.tradeableDenoms
    ])
  ]

  return Object.entries(accountStore.balancesMap).reduce(
    (list, [denom, amount]) => {
      if (!showUnverifiedAssets.value && !tradeableDenoms.includes(denom)) {
        return list
      }

      const cw20Address = getCw20AddressFromDenom(denom)
      const cw20Balance = accountStore.cw20BalancesMap[cw20Address] || '0'
      const subaccountBalance = balances.find(
        (balance) => balance.denom === denom
      )

      const availableBalanceInBank = new BigNumberInBase(amount).plus(
        cw20Balance
      )
      const inOrderBalance = new BigNumberInBase(
        subaccountBalance?.totalBalance || 0
      )

      return [
        ...list,
        {
          denom,
          inOrderBalance: inOrderBalance.toFixed(),
          availableBalance: availableBalanceInBank.toFixed(),
          totalBalance: availableBalanceInBank.plus(inOrderBalance).toFixed()
        }
      ]
    },
    [] as SubaccountBalanceWithInOrder[]
  )
}

function getDenomPositionMap(positions: PositionV2[]) {
  const tokenStore = useTokenStore()
  const derivativeStore = useDerivativeStore()

  return positions.reduce(
    (list, position) => {
      const quoteToken =
        tokenStore.tokenByDenomOrSymbol(position.denom) || usdtToken

      const markPrice = derivativeStore.marketMarkPriceMap[position.marketId]
        .price
        ? sharedToBalanceInWei({
            value: derivativeStore.marketMarkPriceMap[position.marketId].price,
            decimalPlaces: quoteToken.decimals
          })
        : new BigNumberInBase(position.markPrice)

      const pnl = new BigNumberInBase(position.quantity)
        .times(markPrice.minus(position.entryPrice))
        .times(position.direction === TradeDirection.Long ? 1 : -1)

      if (list[position.denom]) {
        const totalPnL = list[position.denom].pnl.plus(pnl)
        const totalMargin = list[position.denom].margin.plus(position.margin)

        return {
          ...list,
          [position.denom]: {
            pnl: totalPnL,
            margin: totalMargin,
            pnlPlusMargin: totalPnL.plus(totalMargin)
          }
        }
      }

      return {
        ...list,
        [position.denom]: {
          pnl,
          pnlPlusMargin: pnl.plus(position.margin),
          margin: new BigNumberInBase(position.margin)
        }
      }
    },
    {} as Record<
      string,
      {
        pnl: BigNumberInBase
        margin: BigNumberInBase
        pnlPlusMargin: BigNumberInBase
      }
    >
  )
}

export function useBalance() {
  const spotStore = useSpotStore()
  const tokenStore = useTokenStore()
  const accountStore = useAccountStore()
  const exchangeStore = useExchangeStore()
  const positionStore = usePositionStore()
  const derivativeStore = useDerivativeStore()
  const sharedWalletStore = useSharedWalletStore()

  const subaccountPortfolioBalanceMap = computed(() => {
    const tradeableDenoms = [
      ...new Set([
        ...spotStore.tradeableDenoms,
        ...derivativeStore.tradeableDenoms
      ])
    ]

    return Object.keys(accountStore.subaccountBalancesMap).reduce(
      (subaccountIdBalanceMap, subaccountId) => {
        const isDefaultTradingAccount =
          sharedWalletStore.authZOrDefaultSubaccountId === subaccountId

        const subaccountPositionPnlDenomMap = getDenomPositionMap(
          positionStore.positionsBySubaccountId(subaccountId)
        )

        const subaccountBalances = isDefaultTradingAccount
          ? calculateDefaultSubaccountBalance(
              accountStore.subaccountBalancesMap[subaccountId] || []
            )
          : calculateSubaccountBalance(
              accountStore.subaccountBalancesMap[subaccountId] || []
            )

        return {
          ...subaccountIdBalanceMap,
          [subaccountId]: subaccountBalances
            .map((balance) => {
              const token = tokenStore.tokenByDenomOrSymbol(balance.denom)

              if (!token || !balance) {
                return undefined
              }

              const usdPrice = tokenStore.tokenUsdPrice(token)
              const isVerified = tradeableDenoms.includes(balance.denom)
              const unrealizedPnlAndMargin = new BigNumberInBase(
                subaccountPositionPnlDenomMap[balance.denom]?.pnlPlusMargin || 0
              )
              const totalBalance = new BigNumberInBase(
                balance.totalBalance
              ).plus(unrealizedPnlAndMargin)

              const totalBalanceInUsd = sharedToBalanceInTokenInBase({
                value: totalBalance.toFixed(),
                decimalPlaces: token.decimals
              })
                .times(usdPrice)
                .toFixed()

              return {
                ...balance,
                token,
                usdPrice,
                isVerified,
                totalBalanceInUsd,
                denom: token.denom,
                totalBalance: totalBalance.toFixed(),
                unrealizedPnl: unrealizedPnlAndMargin.toFixed()
              }
            })
            .filter((balance) => balance) as AccountBalance[]
        }
      },
      {} as Record<string, AccountBalance[]>
    )
  })

  const activeSubaccountPositionPnlDenomMap = computed(() =>
    getDenomPositionMap(positionStore.subaccountPositions)
  )

  const activeSubaccountTradableBalancesWithToken = computed(() => {
    const tradeableDenoms = [
      ...new Set([
        ...spotStore.tradeableDenoms,
        ...derivativeStore.tradeableDenoms
      ])
    ]

    return (
      subaccountPortfolioBalanceMap.value[accountStore.subaccountId] || []
    ).filter(
      (balance) => balance && tradeableDenoms.includes(balance.denom)
    ) as AccountBalance[]
  })

  const activeSubaccountBalancesWithToken = computed(
    () =>
      (
        subaccountPortfolioBalanceMap.value[accountStore.subaccountId] || []
      ).filter((balance) => balance) as AccountBalance[]
  )

  const userBalancesWithToken = computed(() => {
    if (showUnverifiedAssets.value) {
      return activeSubaccountBalancesWithToken.value
    }

    return activeSubaccountTradableBalancesWithToken.value
  })

  const stakedAmount = computed(() => {
    if (
      !exchangeStore.feeDiscountAccountInfo ||
      !exchangeStore.feeDiscountAccountInfo.accountInfo
    ) {
      return ZERO_IN_BASE
    }

    return sharedToBalanceInTokenInBase({
      value: exchangeStore.feeDiscountAccountInfo.accountInfo.stakedAmount
    })
  })

  const stakedAmountInUsd = computed(() => {
    const injUsdPrice = tokenStore.tokenUsdPrice(injToken)

    if (!injUsdPrice) {
      return ZERO_IN_BASE
    }

    return stakedAmount.value.times(injUsdPrice)
  })

  const activeSubaccountTotalBalanceInUsd = computed(() => {
    const tradeableDenoms = [
      ...new Set([
        ...spotStore.tradeableDenoms,
        ...derivativeStore.tradeableDenoms
      ])
    ]

    const totalBalanceInUsd =
      (
        subaccountPortfolioBalanceMap.value[accountStore.subaccountId] || []
      ).reduce((total, balance) => {
        if (
          !showUnverifiedAssets.value &&
          !tradeableDenoms.includes(balance.denom)
        ) {
          return total
        }

        return total.plus(balance.totalBalanceInUsd)
      }, ZERO_IN_BASE) || ZERO_IN_BASE

    if (!accountStore.isDefaultSubaccount) {
      return totalBalanceInUsd
    }

    return totalBalanceInUsd.plus(stakedAmountInUsd.value)
  })

  const aggregatedSubaccountTotalBalanceInUsd = computed(() => {
    const tradeableDenoms = [
      ...new Set([
        ...spotStore.tradeableDenoms,
        ...derivativeStore.tradeableDenoms
      ])
    ]

    return Object.keys(subaccountPortfolioBalanceMap.value)
      .reduce(
        (balances, subaccountId) => [
          ...balances,
          ...subaccountPortfolioBalanceMap.value[subaccountId]
        ],
        [] as AccountBalance[]
      )
      .reduce((total, balance) => {
        if (!balance) {
          return total
        }

        if (
          !showUnverifiedAssets.value &&
          !tradeableDenoms.includes(balance.denom)
        ) {
          return total
        }

        return total.plus(balance.totalBalanceInUsd)
      }, ZERO_IN_BASE)
      .plus(stakedAmountInUsd.value)
  })

  return {
    stakedAmount,
    stakedAmountInUsd,
    showUnverifiedAssets,
    userBalancesWithToken,
    subaccountPortfolioBalanceMap,
    activeSubaccountTotalBalanceInUsd,
    activeSubaccountPositionPnlDenomMap,
    aggregatedSubaccountTotalBalanceInUsd,
    activeSubaccountTradableBalancesWithToken
  }
}
