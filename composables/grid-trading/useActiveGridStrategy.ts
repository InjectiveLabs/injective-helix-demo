import { ZERO_IN_BASE } from '@shared/utils/constant'
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'
import { UiSpotMarket, AccountBalance, StrategyStatus } from '@/types'

export default function useActiveGridStrategy(
  market: ComputedRef<UiSpotMarket>,
  strategy: ComputedRef<TradingStrategy>,
  subaccountBalancesMap?: ComputedRef<Record<string, AccountBalance[]>>
) {
  const spotStore = useSpotStore()
  const tokenStore = useTokenStore()
  const sharedWalletStore = useSharedWalletStore()

  const lastTradedPrice = ref(ZERO_IN_BASE)

  const marketSubaccountId = computed(() =>
    addressAndMarketSlugToSubaccountId(
      sharedWalletStore.address,
      market.value.slug
    )
  )

  const marketSubaccountBalances = computed(
    () => (subaccountBalancesMap?.value || {})[marketSubaccountId.value] || []
  )

  const accountTotalBalanceInUsd = computed(() =>
    marketSubaccountBalances.value.reduce(
      (total, balance) => total.plus(balance.totalBalanceInUsd),
      ZERO_IN_BASE
    )
  )

  const investment = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    if (strategy.value.state === StrategyStatus.Active) {
      return accountTotalBalanceInUsd.value
    }

    const baseAmountInUsd = new BigNumberInWei(strategy.value.baseQuantity || 0)
      .toBase(market.value?.baseToken.decimals)
      .times(new BigNumberInBase(strategy.value.executionPrice))

    const quoteAmountInUsd = new BigNumberInWei(
      strategy.value.quoteQuantity || 0
    ).toBase(market.value?.quoteToken.decimals)

    return baseAmountInUsd
      .plus(quoteAmountInUsd)
      .times(tokenStore.tokenUsdPrice(market.value.quoteToken))
  })

  const pnl = computed(() => {
    if (!market.value || !marketSubaccountBalances.value) {
      return ZERO_IN_BASE
    }

    const creationQuoteQuantity = new BigNumberInWei(
      strategy.value.subscriptionQuoteQuantity || 0
    ).toBase(market.value?.quoteToken.decimals)

    const creationBaseQuantity = new BigNumberInWei(
      strategy.value.subscriptionBaseQuantity
    ).toBase(market.value?.baseToken.decimals)

    const creationMidPrice = new BigNumberInBase(strategy.value.executionPrice)

    const currentQuoteQuantity =
      strategy.value.state === StrategyStatus.Active
        ? new BigNumberInWei(
            marketSubaccountBalances.value.find(
              (balance) => balance.denom === market.value?.quoteDenom
            )?.totalBalance || 0
          ).toBase(market.value?.quoteToken.decimals)
        : new BigNumberInWei(strategy.value.quoteDeposit).toBase(
            market.value?.quoteToken.decimals
          )

    const currentBaseQuantity =
      strategy.value.state === StrategyStatus.Active
        ? new BigNumberInWei(
            marketSubaccountBalances.value.find(
              (balance) => balance.denom === market.value?.baseDenom
            )?.totalBalance || 0
          ).toBase(market.value?.baseToken.decimals)
        : new BigNumberInWei(strategy.value.baseDeposit).toBase(
            market.value?.baseToken.decimals
          )

    const currentMidPrice =
      strategy.value.state === StrategyStatus.Active
        ? lastTradedPrice.value
        : new BigNumberInWei(strategy.value.marketMidPrice).toBase(
            market.value.quoteToken.decimals - market.value.baseToken.decimals
          )

    if (
      lastTradedPrice.value.isEqualTo(ZERO_IN_BASE) &&
      strategy.value.state === StrategyStatus.Active
    ) {
      return ZERO_IN_BASE
    }

    return currentQuoteQuantity
      .plus(currentBaseQuantity.times(currentMidPrice))
      .minus(
        creationQuoteQuantity.plus(creationBaseQuantity.times(creationMidPrice))
      )
  })

  const percentagePnl = computed(() =>
    pnl.value.dividedBy(investment.value).times(100).toFixed(2)
  )

  useIntervalFn(
    async () => {
      if (strategy.value.state !== StrategyStatus.Active) {
        return
      }

      const lastTrade = await spotStore.fetchLastTrade({
        marketId: market.value.marketId
      })

      lastTradedPrice.value = new BigNumberInWei(lastTrade.price).toBase(
        market.value.quoteToken.decimals - market.value.baseToken.decimals
      )
    },
    10000,
    { immediateCallback: true }
  )

  return {
    pnl,
    investment,
    percentagePnl,
    marketSubaccountBalances
  }
}
