<script setup lang="ts">
import { SharedMarketType } from '@shared/types'
import { rwaMarketsInIAssets } from '@/app/data/market'
import { INDEX_MARKETS_INFO } from '@/app/utils/constants'
import { calculateLeverage } from '@/app/utils/formatters'
import { TradePage, TradeSubPage, TradingInterface } from '@/types'
import type { UiMarketWithToken, UiDerivativeMarket } from '@/types'

const route = useRoute()
const jsonStore = useSharedJsonStore()

const props = withDefaults(
  defineProps<{
    includeName?: boolean
    market: UiMarketWithToken
  }>(),
  {
    includeName: false
  }
)

const hasGridStrategyEnabled = computed(() =>
  [...jsonStore.spotGridMarkets, ...jsonStore.derivativeGridMarkets]
    .map(({ slug }) => slug)
    .includes(props.market.slug)
)

const isGridTradeInterface = computed(
  () => route.query.interface === TradingInterface.TradingBots
)

const marketRoute = computed(() =>
  props.market.isVerified
    ? {
        name:
          props.market.type === SharedMarketType.Spot
            ? TradeSubPage.Spot
            : TradeSubPage.Futures,
        params: { slug: props.market.slug },
        query:
          isGridTradeInterface.value && hasGridStrategyEnabled.value
            ? {
                interface: TradingInterface.TradingBots
              }
            : undefined
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

const isRwaMarket = computed(() =>
  jsonStore.isTradeFiMarket(props.market.marketId)
)

const showRwaTooltip = computed(
  () =>
    jsonStore.helixMarketCategoriesMap.rwa.includes(props.market.marketId) ||
    rwaMarketsInIAssets.includes(props.market.marketId)
)

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
  <div>
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

        <div
          :class="{
            'ml-1': includeName
          }"
        >
          <div class="flex items-center gap-2">
            <span
              :class="{
                'font-bold': includeName,
                'border-b border-white border-dashed':
                  isRwaMarket || indexMarketInfo
              }"
            >
              {{ market.ticker }}
            </span>

            <span
              v-if="leverage"
              class="text-2xs bg-blue-500 bg-opacity-20 font-semibold rounded-md text-blue-550 p-1"
            >
              {{ leverage }}x
            </span>
          </div>

          <div v-if="includeName" class="flex items-center gap-1">
            <p class="text-coolGray-400 text-xs">{{ market.baseToken.name }}</p>
            <PartialsTradeStatsCategoryChip v-bind="{ market }" />
          </div>
        </div>
      </NuxtLink>

      <template v-if="isRwaMarket || indexMarketInfo" #panel>
        <div v-if="isRwaMarket">
          <span>
            {{
              $t(
                `trade.rwa.${
                  showRwaTooltip ? 'rwaClosedMarketRow' : 'nyseClosedMarketRow'
                }`
              )
            }}
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
                {{ $t('common.here') }}
              </a>
            </template>
          </i18n-t>
        </div>
      </template>
    </UPopover>
  </div>
</template>
