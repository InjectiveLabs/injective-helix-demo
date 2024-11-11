<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { format, formatDistance } from 'date-fns'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  durationFormatter,
  addressAndMarketSlugToSubaccountId
} from '@/app/utils/helpers'
import * as EventTracker from '@/app/providers/mixpanel/EventTracker'
import { StrategyStatus } from '@/types'

const props = withDefaults(
  defineProps<{
    strategy: TradingStrategy
    decimalPlaces?: number
  }>(),
  {
    strategy: undefined,
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const spotStore = useSpotStore()
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

const {
  stopLoss,
  upperBound,
  lowerBound,
  takeProfit,
  stopBaseQuantity,
  stopQuoteQuantity,
  creationBaseQuantity,
  creationQuoteQuantity,
  creationExecutionPrice,
  subscriptionBaseQuantity,
  subscriptionQuoteQuantity
} = useActiveGridStrategyTransformer(
  market,
  computed(() => props.strategy)
)

const { investment, pnl, percentagePnl } = useActiveGridStrategy(
  market,
  computed(() => props.strategy)
)

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
