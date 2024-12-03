<script setup lang="ts">
import {
  NuxtUiIcons,
  SharedMarketChange,
  SharedUiMarketSummary
} from '@shared/types'
import { dataCyTag } from '@shared/utils'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { PerpetualMarket } from '@injectivelabs/sdk-ts'
import { formatFundingRate } from '@shared/transformer/market/fundingRate'
import { rwaMarketIds } from '@/app/data/market'
import { abbreviateNumber } from '@/app/utils/formatters'
import { UI_DEFAULT_FUNDING_RATE_DECIMALS } from '@/app/utils/constants'
import { UiMarketWithToken, UiDerivativeMarket, MarketCyTags } from '@/types'

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
    volumeInUsd: BigNumberInBase
    summary: SharedUiMarketSummary
    marketPriceMap?: Record<string, BigNumberInBase>
  }>(),
  {
    marketPriceMap: () => ({})
  }
)

const appStore = useAppStore()
const isMobile = useIsMobile()
const derivativeStore = useDerivativeStore()

const isRWAMarket = computed(() => rwaMarketIds.includes(props.market.marketId))

const lastTradedPrice = computed(
  () =>
    props.marketPriceMap[props.market.marketId]?.toFixed() ||
    props.summary.lastPrice ||
    0
)

const { valueToFixed: volumeToFixed } = useSharedBigNumberFormatter(
  computed(() => props.volumeInUsd),
  {
    decimalPlaces: 0
  }
)

const {
  valueToFixed: openInterestToFixed,
  valueToBigNumber: openInterestToBigNumber
} = useSharedBigNumberFormatter(
  computed(
    () => derivativeStore.tickerOpenInterestMap[props.market.ticker] || 0
  )
)

const {
  valueToFixed: fundingRateToFixed,
  valueToBigNumber: fundingRateToBigNumber
} = useSharedBigNumberFormatter(
  computed(() => {
    const market = props.market as PerpetualMarket

    return formatFundingRate({
      info: market.perpetualMarketInfo,
      funding: market.perpetualMarketFunding
    })
  }),
  {
    roundingMode: BigNumberInBase.ROUND_DOWN,
    decimalPlaces: UI_DEFAULT_FUNDING_RATE_DECIMALS
  }
)

const { valueToBigNumber: leverageToBigNumber, valueToFixed: leverageToFixed } =
  useSharedBigNumberFormatter(
    computed(() => {
      const market = props.market as UiDerivativeMarket

      if (!market.initialMarginRatio) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(1).dividedBy(
        (props.market as UiDerivativeMarket).initialMarginRatio
      )
    }),
    {
      decimalPlaces: 0
    }
  )

const priceChangeClasses = computed(() => {
  if (props.summary.lastPriceChange === SharedMarketChange.NoChange) {
    return 'text-coolGray-350'
  }

  return props.summary.lastPriceChange === SharedMarketChange.Increase
    ? 'text-green-500'
    : 'text-red-500'
})

function toggleFavorite() {
  appStore.setUserState({
    ...appStore.userState,
    favoriteMarkets: appStore.userState.favoriteMarkets.includes(
      props.market.marketId
    )
      ? appStore.userState.favoriteMarkets.filter(
          (marketId) => marketId !== props.market.marketId
        )
      : [...appStore.userState.favoriteMarkets, props.market.marketId]
  })
}
</script>

<template>
  <PartialsCommonMarketRedirection
    v-bind="{ market }"
    class="flex items-center text-coolGray-350 hover:text-white py-1 px-2 hover:bg-brand-800"
  >
    <div class="flex items-center flex-[4] md:flex-[3] truncate min-w-0">
      <div
        :class="{
          '!text-blue-500': appStore.favoriteMarkets.includes(market.marketId)
        }"
        class="pr-2 w-8 text-coolGray-700 hover:text-blue-700"
        @click.stop.prevent="toggleFavorite"
      >
        <UIcon :name="NuxtUiIcons.Star" class="h-6 w-6 min-w-6 align-bottom" />
      </div>

      <CommonTokenIcon v-bind="{ token: market.baseToken }" />

      <div class="ml-2">
        <div class="flex items-center gap-2">
          <CommonHeaderTooltip
            :tooltip="$t('trade.rwa.marketClosedMarketRow')"
            :is-disabled="!isRWAMarket"
            is-not-styled
            text-color-class="text-white"
            :classes="
              isRWAMarket ? 'border-dashed border-b cursor-pointer' : ''
            "
            tooltip-class="text-xs"
            :ui="{
              base: 'translate-y-4'
            }"
          >
            <span
              :data-cy="dataCyTag(MarketCyTags.MarketTicker)"
              class="text-xs"
            >
              {{ market.ticker }}
            </span>
          </CommonHeaderTooltip>

          <div
            v-if="leverageToBigNumber.gt(0)"
            class="text-xs bg-blue-550 bg-opacity-80 px-1 py-0.5 font-semibold rounded-md text-white"
          >
            {{ leverageToFixed }}x
          </div>
        </div>
      </div>
    </div>

    <div
      class="flex justify-end flex-[2] lg:flex-[1] truncate min-w-0 font-mono text-xs text-right"
    >
      <AppAmount
        :data-cy="dataCyTag(MarketCyTags.MarketLastPrice)"
        v-bind="{
          amount: lastTradedPrice,
          decimalPlaces: market.priceDecimals
        }"
      />
    </div>

    <div
      :class="priceChangeClasses"
      class="flex items-center flex-[2] truncate min-w-0 font-mono text-xs justify-end"
      :data-cy="dataCyTag(MarketCyTags.MarketPriceChange)"
    >
      {{ summary.change }}%
    </div>

    <div
      class="flex items-center justify-end flex-[2] truncate min-w-0 font-mono text-xs"
    >
      <span v-if="fundingRateToBigNumber.isZero()"> &mdash; </span>
      <span
        v-else
        :class="{
          'text-green-500': fundingRateToBigNumber.gte(0),
          'text-red-500': fundingRateToBigNumber.lt(0)
        }"
        class="cursor-pointer flex"
      >
        <span> {{ fundingRateToBigNumber.gt(0) ? '+' : '' }}</span>
        <AppAmount
          v-bind="{
            amount: fundingRateToFixed,
            decimalPlaces: UI_DEFAULT_FUNDING_RATE_DECIMALS
          }"
        />
        <span>%</span>
      </span>
    </div>

    <div
      class="flex items-center justify-end flex-[2] truncate min-w-0 font-mono text-xs"
    >
      <span v-if="isMobile">
        <span>$</span>
        <span v-if="abbreviateNumber(volumeToFixed)">
          {{ abbreviateNumber(volumeToFixed) }}
        </span>
        <span v-else>
          <AppUsdAmount
            v-bind="{
              decimalPlaces: 0,
              isShowNoDecimals: true,
              amount: volumeInUsd.toFixed()
            }"
          />
        </span>
      </span>
      <span v-else :data-cy="dataCyTag(MarketCyTags.MarketVolume)">
        <span>$</span>
        <AppUsdAmount
          v-bind="{
            decimalPlaces: 0,
            isShowNoDecimals: true,
            amount: volumeInUsd.toFixed()
          }"
        />
      </span>
    </div>

    <div
      class="flex items-center justify-end flex-[2] truncate min-w-0 font-mono text-xs"
    >
      <span v-if="openInterestToBigNumber.isZero()"> &mdash; </span>
      <span v-else>
        <span>$</span>
        <AppUsdAmount
          v-bind="{
            decimalPlaces: 0,
            isShowNoDecimals: true,
            amount: openInterestToFixed
          }"
        />
      </span>
    </div>
  </PartialsCommonMarketRedirection>
</template>
