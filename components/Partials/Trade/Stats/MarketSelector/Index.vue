<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { calculateLeverage } from '@/app/utils/formatters'
import {
  IsSpotKey,
  CommonCyTags,
  UiMarketWithToken,
  UiDerivativeMarket
} from '@/types'

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

const isSpot = inject(IsSpotKey)
const isLocked = useScrollLock(document.documentElement)

const el = ref<HTMLElement | null>(null)
const toggleEl = ref<HTMLElement | null>(null)

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

const isBiudlPerpMarket = computed(
  () => props.market.slug === 'buidl-usdt-perp'
)

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

onClickOutside(el, closeMarketSection, { ignore: [toggleEl] })
</script>

<template>
  <div class="xl:basis-[450px]">
    <div
      ref="toggleEl"
      class="flex max-xl:py-4 items-center pr-4 border-r hover:bg-brand-875 cursor-pointer select-none h-full"
      @click="toggleOpen"
    >
      <CommonTokenIcon class="mx-4" v-bind="{ token: market.baseToken }" />
      <div class="flex items-center space-x-2 justify-center relative">
        <div>
          <CommonHeaderTooltip
            :is-disabled="!isBiudlPerpMarket"
            :popper="{
              placement: 'top',
              strategy: 'fixed',
              offsetDistance: -40
            }"
          >
            <span
              class="uppercase tracking-wider font-bold text-base"
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
              <i18n-t v-if="isBiudlPerpMarket" keypath="markets.buidlTooltip">
                <template #docs>
                  <NuxtLink
                    target="_blank"
                    class="text-blue-500 hover:text-opacity-90"
                    to="https://docs.trading.injective.network/learn/index-perps"
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

          <p class="text-coolGray-400 text-xs">{{ market.baseToken.name }}</p>
        </div>

        <div class="absolute left-full">
          <UIcon
            v-if="market.isVerified"
            :name="NuxtUiIcons.CheckShieldOutline"
            class="text-green-500 w-5 h-5 min-w-5"
          />
        </div>
      </div>

      <div
        class="text-coolGray-400 max-lg:ml-auto max-xl:ml-12 xl:ml-auto flex items-center"
      >
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
      class="absolute backdrop-blur-sm top-full z-30 w-screen left-0 flex"
      @keydown.escape="closeMarketSection"
    >
      <div
        ref="el"
        class="basis-[1000px] w-full min-w-0 overflow-y-auto bg-brand-900 border pb-2 h-[calc(100vh-131px)] sm:h-[calc(100vh-272px)] lg:h-[calc(100vh-185px)] xl:h-[calc(100vh-140px)]"
        @click.stop
      >
        <PartialsTradeStatsMarketSelectorPanel v-bind="{ marketPriceMap }" />
      </div>
    </div>
  </div>
</template>
