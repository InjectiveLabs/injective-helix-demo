<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  NuxtUiIcons,
  SharedMarketType,
  SharedMarketChange
} from '@shared/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { SpotMarketCyTags } from '@/types'
import type { UiMarketWithToken } from '@/types'

const sharedSpotStore = useSharedSpotStore()
const sharedDerivativeStore = useSharedDerivativeStore()

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
  }>(),
  {}
)

const isSpot = computed(() => props.market.type === SharedMarketType.Spot)

const { lastTradedPrice: spotLastTradedPrice } = useSpotLastPrice(
  computed(() => props.market)
)
const { lastTradedPrice: derivativeLastTradedPrice } = useDerivativeLastPrice(
  computed(() => props.market)
)

const summary = computed(() => {
  if (isSpot.value) {
    return sharedSpotStore.marketsSummary.find(
      (market) => market.marketId === props.market.marketId
    )
  }

  return sharedDerivativeStore.marketsSummary.find(
    (market) => market.marketId === props.market.marketId
  )
})

const lastTradedPrice = computed(() =>
  isSpot.value ? spotLastTradedPrice.value : derivativeLastTradedPrice.value
)

const change = computed(() => {
  if (!summary.value || !summary.value.change) {
    return ZERO_IN_BASE
  }

  return summary.value.change
})

const changeToBigNumber = computed(() => new BigNumberInBase(change.value))

const percentageChangeStatus = computed(() => {
  if (changeToBigNumber.value.eq(0)) {
    return SharedMarketChange.NoChange
  }

  return changeToBigNumber.value.gt(0)
    ? SharedMarketChange.Increase
    : SharedMarketChange.Decrease
})
</script>

<template>
  <div
    class="lg:flex max-lg:text-xs max-lg:p-1 max-lg:divide-y max-lg:[&>*]:p-1 lg:space-x-8"
  >
    <section class="flex p-2 2xl:px-0 3xl:p-2 justify-between">
      <p class="text-coolGray-400 lg:hidden">{{ $t('trade.price') }}</p>

      <article
        class="flex items-center lg:flex-col lg:items-end lg:justify-between lg:px-2 lg:py-0.5 2xl:pr-0 3xl:pr-2"
        :data-cy="dataCyTag(SpotMarketCyTags.TradeStatsInfoPrice)"
      >
        <div class="flex items-center justify-between">
          <div
            class="flex items-center"
            :class="{
              'text-green-500':
                percentageChangeStatus === SharedMarketChange.Increase,
              'text-red-500 ':
                percentageChangeStatus === SharedMarketChange.Decrease
            }"
          >
            <span v-if="lastTradedPrice.isZero()"> &mdash; </span>
            <template v-else>
              <UIcon
                v-if="
                  [
                    SharedMarketChange.Increase,
                    SharedMarketChange.Decrease
                  ].includes(percentageChangeStatus)
                "
                :name="NuxtUiIcons.ArrowLeft"
                class="w-3 h-3 mr-1"
                :class="{
                  ' rotate-90':
                    percentageChangeStatus === SharedMarketChange.Increase,
                  ' -rotate-90':
                    percentageChangeStatus === SharedMarketChange.Decrease
                }"
              />
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  shouldAbbreviate: false,
                  decimals: market.priceDecimals,
                  amount: lastTradedPrice.toFixed()
                }"
                class="leading-none"
              />
            </template>
          </div>
        </div>

        <div
          v-if="!changeToBigNumber.isNaN()"
          class="leading-none text-xs"
          :class="{
            'text-green-500':
              percentageChangeStatus === SharedMarketChange.Increase,
            'text-white':
              percentageChangeStatus === SharedMarketChange.NoChange,
            'text-red-500':
              percentageChangeStatus === SharedMarketChange.Decrease
          }"
        >
          <span class="lg:hidden">/</span>
          <span>
            <SharedAmount
              v-bind="{
                amount: change,
                useSubscript: true,
                noTrailingZeros: false,
                shouldAbbreviate: false,
                decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
            />%
          </span>
        </div>
      </article>
    </section>

    <PartialsTradeStatsInfoSpot v-if="isSpot" v-bind="{ market }" />
    <PartialsTradeStatsInfoDerivative v-else v-bind="{ market }" />
  </div>
</template>
