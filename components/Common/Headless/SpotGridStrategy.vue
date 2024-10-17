<script setup lang="ts">
import {
  Status,
  StatusType,
  BigNumberInWei,
  BigNumberInBase
} from '@injectivelabs/utils'
import { format, formatDistance } from 'date-fns'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import {
  durationFormatter,
  addressAndMarketSlugToSubaccountId
} from '@/app/utils/helpers'
import * as EventTracker from '@/app/providers/mixpanel/EventTracker'
import { StrategyStatus } from '@/types'

const props = withDefaults(
  defineProps<{
    strategy: TradingStrategy
  }>(),
  {
    strategy: undefined
  }
)

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const now = useNow({ interval: 1000 })

const lastTradedPrice = ref(ZERO_IN_BASE)
const removeStatus = reactive(new Status(StatusType.Idle))

const market = computed(
  () =>
    spotStore.markets.find(
      ({ marketId }) => marketId === props.strategy.marketId
    )!
)

const investment = computed(() => {
  if (!market.value) {
    return ZERO_IN_BASE
  }

  const baseAmountInUsd = new BigNumberInWei(props.strategy.baseQuantity || 0)
    .toBase(market.value?.baseToken.decimals)
    .times(new BigNumberInBase(props.strategy.executionPrice))

  const quoteAmountInUsd = new BigNumberInWei(
    props.strategy.quoteQuantity || 0
  ).toBase(market.value?.quoteToken.decimals)

  return baseAmountInUsd
    .plus(quoteAmountInUsd)
    .times(tokenStore.tokenUsdPrice(market.value.quoteToken))
})

const subaccountBalances = computed(
  () =>
    accountStore.subaccountBalancesMap[
      addressAndMarketSlugToSubaccountId(
        sharedWalletStore.address,
        market.value.slug
      )
    ]
)

const pnl = computed(() => {
  if (!market.value || !subaccountBalances.value) {
    return ZERO_IN_BASE
  }

  const creationQuoteQuantity = new BigNumberInWei(
    props.strategy.subscriptionQuoteQuantity || 0
  ).toBase(market.value?.quoteToken.decimals)

  const creationBaseQuantity = new BigNumberInWei(
    props.strategy.subscriptionBaseQuantity
  ).toBase(market.value?.baseToken.decimals)

  const creationMidPrice = new BigNumberInBase(props.strategy.executionPrice)

  const currentQuoteQuantity =
    props.strategy.state === StrategyStatus.Active
      ? new BigNumberInWei(
          subaccountBalances.value.find(
            (balance) => balance.denom === market.value?.quoteDenom
          )?.totalBalance || 0
        ).toBase(market.value?.quoteToken.decimals)
      : new BigNumberInWei(props.strategy.quoteDeposit).toBase(
          market.value?.quoteToken.decimals
        )

  const currentBaseQuantity =
    props.strategy.state === StrategyStatus.Active
      ? new BigNumberInWei(
          subaccountBalances.value.find(
            (balance) => balance.denom === market.value?.baseDenom
          )?.totalBalance || 0
        ).toBase(market.value?.baseToken.decimals)
      : new BigNumberInWei(props.strategy.baseDeposit).toBase(
          market.value?.baseToken.decimals
        )

  const currentMidPrice =
    props.strategy.state === StrategyStatus.Active
      ? lastTradedPrice.value
      : new BigNumberInWei(props.strategy.marketMidPrice).toBase(
          market.value.quoteToken.decimals - market.value.baseToken.decimals
        )

  if (
    lastTradedPrice.value.isEqualTo(ZERO_IN_BASE) &&
    props.strategy.state === StrategyStatus.Active
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

const upperBound = computed(() => {
  if (!market.value) {
    return ZERO_IN_BASE
  }

  return new BigNumberInWei(props.strategy.upperBound).toBase(
    market.value.quoteToken.decimals - market.value.baseToken.decimals
  )
})

const lowerBound = computed(() => {
  if (!market.value) {
    return ZERO_IN_BASE
  }

  return new BigNumberInWei(props.strategy.lowerBound).toBase(
    market.value.quoteToken.decimals - market.value.baseToken.decimals
  )
})

const creationExecutionPrice = computed(
  () => new BigNumberInBase(props.strategy.executionPrice)
)

const stopBaseQuantity = computed(() =>
  new BigNumberInWei(props.strategy.baseDeposit || 0).toBase(
    market.value?.baseToken.decimals
  )
)

const stopQuoteQuantity = computed(() =>
  new BigNumberInWei(props.strategy.quoteDeposit || 0).toBase(
    market.value?.quoteToken.decimals
  )
)

const creationQuoteQuantity = computed(() =>
  new BigNumberInWei(props.strategy.quoteQuantity || 0).toBase(
    market.value?.quoteToken.decimals
  )
)

const creationBaseQuantity = computed(() =>
  new BigNumberInWei(props.strategy.baseQuantity).toBase(
    market.value?.baseToken.decimals
  )
)

const subscriptionQuoteQuantity = computed(() =>
  new BigNumberInWei(props.strategy.subscriptionQuoteQuantity || 0).toBase(
    market.value?.quoteToken.decimals
  )
)
const subscriptionBaseQuantity = computed(() =>
  new BigNumberInWei(props.strategy.subscriptionBaseQuantity).toBase(
    market.value?.baseToken.decimals
  )
)

const takeProfit = computed(() =>
  new BigNumberInWei(props.strategy.takeProfitConfig?.exitPrice ?? 0).toBase(
    market.value.quoteToken.decimals - market.value.baseToken.decimals
  )
)

const stopLoss = computed(() =>
  new BigNumberInWei(props.strategy.stopLossConfig?.exitPrice || 0).toBase(
    market.value.quoteToken.decimals - market.value.baseToken.decimals
  )
)

const totalInvestment = computed(() => {
  const baseAmountInUsd = subscriptionBaseQuantity.value.times(
    new BigNumberInWei(props.strategy.executionPrice).toBase(
      market.value?.quoteToken.decimals
    )
  )

  const quoteAmountInUsd = new BigNumberInWei(
    props.strategy.subscriptionQuoteQuantity || 0
  ).toBase(market.value?.quoteToken.decimals)

  return baseAmountInUsd.plus(quoteAmountInUsd)
})

const createdAt = computed(() =>
  format(new Date(Number(props.strategy.createdAt)), 'dd MMM HH:mm:ss')
)

const duration = computed(() =>
  formatDistance(Number(props.strategy.createdAt), now.value.getTime())
)

const gridStrategySubaccountId = computed(() =>
  addressAndMarketSlugToSubaccountId(
    sharedWalletStore.address,
    market.value.slug
  )
)

function removeStrategy() {
  removeStatus.setLoading()

  let err: Error

  gridStrategyStore
    .removeStrategyForSubaccount(
      props.strategy.contractAddress,
      gridStrategySubaccountId.value
    )
    .catch((e) => {
      err = e
      $onError(e)
    })
    .finally(() => {
      removeStatus.setIdle()

      EventTracker.trackRemoveStrategy(
        {
          duration: durationFormatter(props.strategy.createdAt, Date.now()),
          market: gridStrategyStore.spotMarket?.slug || '',
          pnl: pnl.value.toFixed(),
          isLiquidity: false
        },
        err?.message
      )
    })
}

useIntervalFn(
  async () => {
    if (props.strategy.state !== StrategyStatus.Active) {
      return
    }

    const lastTrade = await spotStore.fetchLastTrade({
      marketId: market.value.marketId
    })

    lastTradedPrice.value = sharedToBalanceInTokenInBase({
      value: lastTrade.price,
      decimalPlaces:
        market.value.quoteToken.decimals - market.value.baseToken.decimals
    })
  },
  10 * 1000,
  { immediateCallback: true }
)
</script>

<template>
  <slot
    v-bind="{
      pnl,
      market,
      duration,
      stopLoss,
      createdAt,
      investment,
      upperBound,
      lowerBound,
      takeProfit,
      percentagePnl,
      removeStrategy,
      removeStatus,
      totalInvestment,
      stopBaseQuantity,
      stopQuoteQuantity,
      creationBaseQuantity,
      creationQuoteQuantity,
      creationExecutionPrice,
      subscriptionBaseQuantity,
      gridStrategySubaccountId,
      subscriptionQuoteQuantity
    }"
  />
</template>
