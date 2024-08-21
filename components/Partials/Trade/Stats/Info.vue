<script setup lang="ts">
import { SharedMarketChange } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UiDerivativeMarket, UiMarketWithToken } from '@/types'

withDefaults(
  defineProps<{
    market: UiMarketWithToken
  }>(),
  {}
)
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
        percentageChangeStatus,
        lastTradedPriceToFormat,
        lastTradedPriceInUsdToFormat
      }"
    >
      <div class="hidden lg:flex max-lg:justify-between max-lg:[&>*]:border">
        <div
          class="flex flex-col items-center lg:items-end justify-start px-2 lg:px-4 py-2 font-mono"
        >
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
              {{ lastTradedPriceToFormat }}
            </div>
          </div>

          <div class="mt-auto">
            <div v-if="!change.isNaN()" class="mt-1 text-xs">
              <span
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
                {{ changeToFormat }}%
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="!isStableQuoteAsset"
          class="p-2 text-xs flex flex-col max-lg:text-center"
        >
          <p class="text-gray-400">{{ $t('trade.usd_value') }}</p>
          <p class="font-mono font-semibold mt-auto">
            {{ lastTradedPriceInUsdToFormat }}
          </p>
        </div>

        <div class="p-2 text-xs flex flex-col max-lg:text-center">
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
          <p class="font-mono font-semibold mt-auto">{{ volumeToFormat }}</p>
        </div>

        <div class="p-2 text-xs flex flex-col max-lg:text-center">
          <p class="text-gray-400">{{ $t('trade.high') }}</p>
          <p class="font-mono font-semibold mt-auto">{{ highToFormat }}</p>
        </div>

        <div class="p-2 text-xs flex flex-col max-lg:text-center">
          <p class="text-gray-400">{{ $t('trade.low') }}</p>
          <p class="font-mono font-semibold mt-auto">{{ lowToFormat }}</p>
        </div>

        <div
          v-if="(market as UiDerivativeMarket)?.isPerpetual"
          class="p-2 text-xs flex flex-col max-lg:text-center"
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
          class="p-2 text-xs flex flex-col max-lg:text-center"
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
