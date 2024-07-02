<script setup lang="ts">
import { SharedMarketChange } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UiDerivativeMarket, UiMarketWithToken } from '@/types'

defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})
</script>

<template>
  <CommonHeadlessMarketSummary v-bind="{ market, isCurrentMarket: true }">
    <template
      #default="{
        change,
        countdown,
        fundingRate,
        lowToFormat,
        highToFormat,
        changeToFormat,
        volumeToFormat,
        isStableQuoteAsset,
        volumeInUsdToFormat,
        isNonUsdtQuoteAsset,
        percentageChangeStatus,
        lastTradedPriceToFormat,
        lastTradedPriceInUsdToFormat
      }"
    >
      <div class="text-xs p-1 divide-y [&>*]:p-1">
        <div class="flex justify-between">
          <p class="text-gray-400">{{ $t('trade.price') }}</p>
          <div
            class="flex items-center"
            :class="{
              'text-green-500':
                percentageChangeStatus === SharedMarketChange.Increase,
              'text-red-500 ':
                percentageChangeStatus === SharedMarketChange.Decrease
            }"
          >
            <SharedIcon
              v-if="
                [
                  SharedMarketChange.Increase,
                  SharedMarketChange.Decrease
                ].includes(percentageChangeStatus)
              "
              name="arrow"
              class="w-3 h-3 mr-1"
              :class="{
                ' rotate-90':
                  percentageChangeStatus === SharedMarketChange.Increase,
                ' -rotate-90':
                  percentageChangeStatus === SharedMarketChange.Decrease
              }"
            />

            <div class="leading-none">
              <span>{{ lastTradedPriceToFormat }}</span>

              <span
                v-if="!change.isNaN()"
                class="leading-none"
                :class="{
                  'text-green-500':
                    percentageChangeStatus === SharedMarketChange.Increase,
                  'text-white':
                    percentageChangeStatus === SharedMarketChange.NoChange,
                  'text-red-500':
                    percentageChangeStatus === SharedMarketChange.Decrease
                }"
              >
                / {{ changeToFormat }}%
              </span>
            </div>
          </div>
        </div>

        <div v-if="isNonUsdtQuoteAsset" class="flex justify-between">
          <p>{{ $t('trade.usd_value') }}</p>
          <p class="font-mono font-semibold">
            {{ lastTradedPriceInUsdToFormat }}
          </p>
        </div>

        <div class="flex justify-between">
          <CommonHeaderTooltip
            :tooltip="
              isStableQuoteAsset
                ? $t('trade.market_volume_24h_tooltip')
                : $t('trade.total_volume_in_usd', {
                    amount: volumeInUsdToFormat
                  })
            "
            text-color-class="text-gray-400"
          >
            {{ $t('trade.total_market_volume_24h') }}
          </CommonHeaderTooltip>

          <p class="font-mono text-xs font-semibold">{{ volumeToFormat }}</p>
        </div>

        <div class="flex justify-between">
          <p class="text-gray-400">{{ $t('trade.high') }}</p>
          <p class="font-mono font-semibold mt-auto">{{ highToFormat }}</p>
        </div>

        <div class="flex justify-between">
          <p class="text-gray-400">{{ $t('trade.low') }}</p>
          <p class="font-mono font-semibold mt-auto">{{ lowToFormat }}</p>
        </div>

        <div
          v-if="(market as UiDerivativeMarket)?.isPerpetual"
          class="flex justify-between"
        >
          <CommonHeaderTooltip
            :tooltip="$t('trade.funding_rate_tooltip')"
            text-color-class="text-gray-400"
          >
            {{ $t('trade.est_funding_rate') }}
          </CommonHeaderTooltip>
          <span
            v-if="!fundingRate.isNaN()"
            class="mt-auto lg:text-right font-mono block"
          >
            <span
              :class="{
                'text-green-500': fundingRate.gte(0),
                'text-red-500': fundingRate.lt(0)
              }"
              data-cy="market-info-funding-rate-span"
            >
              {{
                (fundingRate.gt(0) ? '+' : '') +
                fundingRate.toFormat(5, BigNumberInBase.ROUND_DOWN)
              }}%
            </span>
          </span>
          <span v-else class="mt-auto lg:text-right font-mono block">
            &mdash;
          </span>
        </div>

        <div
          v-if="(market as UiDerivativeMarket)?.isPerpetual"
          class="flex justify-between"
        >
          <CommonHeaderTooltip
            :tooltip="$t('trade.next_funding_tooltip')"
            text-color-class="text-gray-400"
          >
            {{ $t('trade.next_funding') }}
          </CommonHeaderTooltip>
          <p class="font-mono font-semibold lg:text-right mt-auto">
            {{ countdown }}
          </p>
        </div>
      </div>
    </template>
  </CommonHeadlessMarketSummary>
</template>
