<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons, SharedMarketType } from '@shared/types'
import { calculateLeverage } from '@/app/utils/formatters'
import { IsSpotKey, CommonCyTags, TradeSubPage } from '@/types'
import type { UiMarketWithToken, UiDerivativeMarket } from '@/types'

const props = withDefaults(
  defineProps<{
    isMarketOpen?: boolean
    market: UiMarketWithToken
  }>(),
  {}
)

const emit = defineEmits<{
  'update:isMarketOpen': [value: boolean]
}>()

const route = useRoute()
const isSpot = inject(IsSpotKey)
const isLocked = useScrollLock(document.documentElement)

const el = ref<null | HTMLElement>(null)
const toggleEl = ref<null | HTMLElement>(null)

const { lastTradedPrice: spotLastTradedPrice } = useSpotLastPrice(
  computed(() => props.market)
)
const { lastTradedPrice: derivativeLastTradedPrice } = useDerivativeLastPrice(
  computed(() => props.market)
)

const { valueToBigNumber: leverageToBigNumber, valueToFixed: leverageToFixed } =
  useSharedBigNumberFormatter(
    computed(() =>
      calculateLeverage(
        (props.market as UiDerivativeMarket)?.initialMarginRatio
      )
    ),
    {
      decimalPlaces: 0
    }
  )

const isExpiryMarket = computed(
  () =>
    !!(props.market as UiDerivativeMarket)?.expiryFuturesMarketInfo
      ?.expirationTimestamp
)

const hasDocsTooltip = computed(
  () =>
    props.market.slug === 'ton-usdt-perp' ||
    props.market.slug === 'h100-usdt-perp' ||
    props.market.slug === 'buidl-usdt-perp'
)

const docsUrl = computed(() => {
  if (
    (props.market as UiDerivativeMarket)?.expiryFuturesMarketInfo &&
    props.market.subType === SharedMarketType.Futures
  ) {
    return 'https://docs.helixapp.com/trading/expiry-futures'
  }

  if (props.market.slug === 'h100-usdt-perp') {
    return 'https://docs.helixapp.com/trading/perpetuals/nvidia-h100-hourly-perp-h100'
  }

  return 'https://docs.trading.injective.network/learn/index-perps'
})

const marketPriceMap = computed(() => ({
  [props.market.marketId]: isSpot
    ? spotLastTradedPrice.value
    : derivativeLastTradedPrice.value
}))

function toggleOpen() {
  const value = !props.isMarketOpen

  isLocked.value = value
  emit('update:isMarketOpen', value)
}

function closeMarketSection() {
  isLocked.value = false
  emit('update:isMarketOpen', false)
}

onClickOutside(el, closeMarketSection, {
  ignore: [toggleEl]
})
</script>

<template>
  <div
    :class="[
      route.name === TradeSubPage.Spot
        ? '2xl:basis-[450px] max-2xl:border-b max-lg:border-0'
        : '5xl:basis-[450px] max-5xl:border-b max-lg:border-0'
    ]"
  >
    <div
      ref="toggleEl"
      :class="[
        route.name === TradeSubPage.Spot ? '2xl:border-r' : '5xl:border-r'
      ]"
      class="relative z-30 flex max-xl:py-4 items-center pr-4 hover:bg-brand-875 cursor-pointer select-none h-full"
      @click="toggleOpen"
    >
      <CommonTokenIcon class="mx-4" v-bind="{ token: market.baseToken }" />
      <div class="flex items-center space-x-2 justify-center relative">
        <div>
          <CommonHeaderTooltip
            :is-disabled="!hasDocsTooltip && !isExpiryMarket"
            :popper="{
              placement: 'top',
              strategy: 'fixed',
              offsetDistance: -40
            }"
          >
            <span
              class="tracking-wider font-bold text-base"
              :data-cy="dataCyTag(CommonCyTags.MarketPair)"
            >
              {{ market.ticker }}
            </span>

            <span
              v-if="leverageToBigNumber.gt(0)"
              class="text-xs bg-blue-500 bg-opacity-20 p-1 font-semibold rounded-md text-blue-550 ml-2"
            >
              {{ leverageToFixed }}x
            </span>

            <template #customTooltip>
              <i18n-t v-if="isExpiryMarket" keypath="markets.expiryDocsTooltip">
                <template #docs>
                  <NuxtLink
                    :to="docsUrl"
                    target="_blank"
                    class="text-blue-500 hover:text-opacity-90"
                  >
                    {{ $t('common.docs') }}
                  </NuxtLink>
                </template>
              </i18n-t>

              <i18n-t v-else-if="hasDocsTooltip" keypath="markets.docsTooltip">
                <template #docs>
                  <NuxtLink
                    :to="docsUrl"
                    target="_blank"
                    class="text-blue-500 hover:text-opacity-90"
                  >
                    {{ $t('common.docs') }}
                  </NuxtLink>
                </template>
              </i18n-t>

              <i18n-t v-else keypath="markets.2024ElectionTooltip">
                <template #docs>
                  <NuxtLink
                    target="_blank"
                    class="text-blue-500 hover:text-opacity-90"
                    to="https://docs.trading.injective.network/learn/election-perpetual-futures"
                  >
                    {{ $t('common.tradingDocs') }}
                  </NuxtLink>
                </template>
              </i18n-t>
            </template>
          </CommonHeaderTooltip>

          <div class="flex items-center gap-1">
            <p class="text-coolGray-400 text-xs">{{ market.baseToken.name }}</p>
            <PartialsTradeStatsCategoryChip v-bind="{ market }" />
          </div>
        </div>

        <div class="absolute left-full">
          <UIcon
            v-if="market.isVerified"
            :name="NuxtUiIcons.CheckShieldOutline"
            class="text-green-500 w-5 h-5 min-w-5"
          />
        </div>
      </div>

      <div class="text-coolGray-400 ml-auto flex items-center">
        <div
          class="ml-10 mr-4 text-sm"
          :data-cy="dataCyTag(CommonCyTags.MarketDropdown)"
        >
          {{ $t('trade.allMarkets') }}
        </div>

        <UIcon
          :name="NuxtUiIcons.ChevronLeft2"
          class="h-3 w-3 min-w-3 -rotate-90"
        />
      </div>
    </div>

    <div
      v-if="isMarketOpen"
      class="absolute top-full z-30 w-screen left-0 flex"
      @keydown.escape="closeMarketSection"
    >
      <div
        ref="el"
        class="basis-[1000px] w-full min-w-0 overflow-y-auto bg-brand-900 border h-[calc(100vh-131px)] sm:h-[calc(100vh-272px)] lg:h-[calc(100vh-203px)]"
        :class="[
          route.name === TradeSubPage.Spot
            ? '2xl:h-[calc(100vh-140px)]'
            : '5xl:h-[calc(100vh-140px)]'
        ]"
        @click.stop
      >
        <PartialsTradeStatsMarketSelectorPanel v-bind="{ marketPriceMap }" />
      </div>
    </div>
  </div>
</template>
