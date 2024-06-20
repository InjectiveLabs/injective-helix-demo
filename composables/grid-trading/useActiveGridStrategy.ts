import { ZERO_IN_BASE } from '@shared/utils/constant'
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'
import { UiSpotMarket, StrategyStatus } from '@/types'

export default function useActiveGridStrategy(
  market: ComputedRef<UiSpotMarket>,
  strategy: ComputedRef<TradingStrategy>
) {
  const spotStore = useSpotStore()
  const walletStore = useSharedWalletStore()
  const accountStore = useAccountStore()
  const tokenStore = useTokenStore()

  const lastTradedPrice = ref(ZERO_IN_BASE)

  const investment = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    const baseAmountInUsd = new BigNumberInWei(strategy.value.baseQuantity || 0)
      .toBase(market.value?.baseToken.decimals)
      .times(
        new BigNumberInWei(strategy.value.executionPrice)
          .dividedBy(
            new BigNumberInBase(10).pow(
              market.value.quoteToken.decimals - market.value.baseToken.decimals
            )
          )
          .toBase()
      )

    const quoteAmountInUsd = new BigNumberInWei(
      strategy.value.quoteQuantity || 0
    ).toBase(market.value?.quoteToken.decimals)

    return baseAmountInUsd
      .plus(quoteAmountInUsd)
      .times(tokenStore.tokenUsdPrice(market.value.quoteToken))
  })

  const subaccountBalances = computed(
    () =>
      accountStore.subaccountBalancesMap[
        addressAndMarketSlugToSubaccountId(
          walletStore.address,
          market.value.slug
        )
      ]
  )

  const pnl = computed(() => {
    if (!market.value || !subaccountBalances.value) {
      return ZERO_IN_BASE
    }

    const creationQuoteQuantity = new BigNumberInWei(
      strategy.value.subscriptionQuoteQuantity || 0
    ).toBase(market.value?.quoteToken.decimals)

    const creationBaseQuantity = new BigNumberInWei(
      strategy.value.subscriptionBaseQuantity
    ).toBase(market.value?.baseToken.decimals)

    const creationMidPrice = new BigNumberInWei(strategy.value.executionPrice)
      .dividedBy(
        new BigNumberInBase(10).pow(
          market.value.quoteToken.decimals - market.value.baseToken.decimals
        )
      )
      .toBase()

    const currentQuoteQuantity =
      strategy.value.state === StrategyStatus.Active
        ? new BigNumberInWei(
            subaccountBalances.value.find(
              (balance) => balance.denom === market.value?.quoteDenom
            )?.totalBalance || 0
          ).toBase(market.value?.quoteToken.decimals)
        : new BigNumberInWei(strategy.value.quoteDeposit).toBase(
            market.value?.quoteToken.decimals
          )

    const currentBaseQuantity =
      strategy.value.state === StrategyStatus.Active
        ? new BigNumberInWei(
            subaccountBalances.value.find(
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
    percentagePnl
  }
}
