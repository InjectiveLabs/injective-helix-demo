<script setup lang="ts">
import { SharedMarketType } from '@shared/types'
import {
  TradePage,
  TradeSubPage,
  UiDerivativeMarket,
  UiMarketWithToken
} from '@/types'
import { rwaMarketIds } from '@/app/data/market'
import { INDEX_MARKETS_INFO } from '~/app/utils/constants'
import { calculateLeverage } from '~/app/utils/formatters'

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
    includeName?: boolean
  }>(),
  {
    includeName: false
  }
)

const marketRoute = computed(() =>
  props.market.isVerified
    ? {
        name:
          props.market.type === SharedMarketType.Spot
            ? TradeSubPage.Spot
            : TradeSubPage.Futures,
        params: { slug: props.market.slug }
      }
    : {
        name: `${
          props.market.type === SharedMarketType.Spot
            ? TradePage.Spot
            : TradePage.Futures
        }`,
        query: {
          marketId: props.market.marketId
        }
      }
)

const isRwaMarket = computed(() => rwaMarketIds.includes(props.market.marketId))

const indexMarketInfo = computed(() =>
  INDEX_MARKETS_INFO.find((market) => market.marketId === props.market.marketId)
)

const leverage = computed(() =>
  (props.market as UiDerivativeMarket).initialMarginRatio
    ? calculateLeverage((props.market as UiDerivativeMarket).initialMarginRatio)
    : undefined
)
</script>

<template>
  <div class="">
    <UPopover
      mode="hover"
      :open-delay="300"
      :popper="{
        placement: 'top',
        strategy: 'absolute'
      }"
      :ui="{
        trigger: 'flex items-center'
      }"
    >
      <NuxtLink :to="marketRoute" class="flex items-center gap-2 text-sm">
        <CommonTokenIcon v-bind="{ token: market.baseToken }" />

        <div>
          <p
            :class="{
              'border-b border-white border-dashed':
                isRwaMarket || indexMarketInfo
            }"
            class="uppercase"
          >
            {{ market.ticker }}
          </p>
          <p v-if="includeName" class="text-xs text-coolGray-500">
            {{ market.baseToken.name }}
          </p>
        </div>

        <div
          v-if="leverage"
          class="text-2xs bg-blue-500 bg-opacity-20 p-1 font-semibold rounded-md text-blue-550"
        >
          {{ leverage }}x
        </div>
      </NuxtLink>

      <template v-if="isRwaMarket || indexMarketInfo" #panel>
        <div v-if="isRwaMarket">
          <span>
            {{ $t('trade.rwa.marketClosedMarketRow') }}
          </span>
        </div>

        <div v-else-if="indexMarketInfo">
          <i18n-t
            :keypath="`markets.indexMarketTooltip`"
            tag="p"
            class="text-xs"
          >
            <template #label>
              {{ indexMarketInfo.label }}
            </template>
            <template #link>
              <a
                class="text-blue-500"
                :href="indexMarketInfo.link"
                target="_blank"
              >
                here
              </a>
            </template>
          </i18n-t>
        </div>
      </template>
    </UPopover>
  </div>
</template>
