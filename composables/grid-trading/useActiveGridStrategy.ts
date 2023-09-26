import { BigNumberInWei } from '@injectivelabs/utils'
import { UiSpotMarketWithToken, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'
import { StrategyStatus } from '@/types'

export default function useActiveGridStrategy(
  market: ComputedRef<UiSpotMarketWithToken>,
  strategy: ComputedRef<TradingStrategy>
) {
  const spotStore = useSpotStore()
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()

  const investment = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    const baseAmountInUsd = new BigNumberInWei(strategy.value.baseQuantity || 0)
      .toBase(market.value?.baseToken.decimals)
      .times(
        new BigNumberInWei(strategy.value.executionPrice).toBase(
          market.value?.quoteToken.decimals
        )
      )

    const quoteAmountInUsd = new BigNumberInWei(
      strategy.value.quoteQuantity || 0
    ).toBase(market.value?.quoteToken.decimals)

    return baseAmountInUsd.plus(quoteAmountInUsd)
  })

  const subaccountBalances = computed(
    () =>
      accountStore.subaccountBalancesMap[
        addressAndMarketSlugToSubaccountId(
          walletStore.address,
          market.value?.slug || ''
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

    const creationMidPrice = new BigNumberInWei(
      strategy.value.executionPrice
    ).toBase(market.value?.quoteToken.decimals)

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

    const orderbookBuy = new BigNumberInWei(
      spotStore.orderbook?.buys[0]?.price || 0
    ).toBase(market.value.quoteToken.decimals - market.value.baseToken.decimals)

    const orderbookSell = new BigNumberInWei(
      spotStore.orderbook?.sells[0]?.price || 0
    ).toBase(market.value.quoteToken.decimals - market.value.baseToken.decimals)

    const currentMidPrice =
      strategy.value.state === StrategyStatus.Active
        ? orderbookSell.minus(orderbookBuy).dividedBy(2).plus(orderbookSell)
        : new BigNumberInWei(strategy.value.marketMidPrice).toBase(
            market.value?.quoteToken.decimals - market.value?.baseToken.decimals
          )

    return currentQuoteQuantity
      .plus(currentBaseQuantity.times(currentMidPrice))
      .minus(
        creationQuoteQuantity.plus(creationBaseQuantity.times(creationMidPrice))
      )
  })

  const percentagePnl = computed(() =>
    pnl.value.dividedBy(investment.value).times(100).toFixed(2)
  )

  return {
    pnl,
    investment,
    percentagePnl
  }
}
