<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { BigNumberInBase } from '@injectivelabs/utils'
import { NuxtUiIcons } from '@shared/types'
import {
  UI_DEFAULT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import {
  MarketKey,
  TradeTypes,
  SpotTradeForm,
  SpotTradeFormField,
  SpotMarketCyTags
} from '@/types'

withDefaults(
  defineProps<{
    total: BigNumberInBase
    quantity: BigNumberInBase
    feeAmount: BigNumberInBase
    worstPrice: BigNumberInBase
    totalWithFee: BigNumberInBase
    feePercentage: BigNumberInBase
    slippagePercentage: BigNumberInBase
  }>(),
  {}
)
const spotMarket = inject(MarketKey)

const spotFormValues = useFormValues<SpotTradeForm>()

const isOpen = ref(true)

const { makerFeeRate, takerFeeRate } = useTradeFee({
  marketTakerFeeRate: spotMarket?.value?.takerFeeRate,
  marketMakerFeeRate: spotMarket?.value?.makerFeeRate
})

const { valueToFixed: takerFeeRateToFixed } = useSharedBigNumberFormatter(
  computed(() => takerFeeRate.value.times(100)),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS,
    shouldTruncate: true
  }
)

const { valueToFixed: makerFeeRateToFixed } = useSharedBigNumberFormatter(
  computed(() => makerFeeRate.value.times(100)),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS,
    shouldTruncate: true
  }
)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div v-if="spotMarket" class="mb-4">
    <div
      class="flex items-center justify-between cursor-pointer select-none"
      @click="toggle"
    >
      <p class="text-xs font-semibold select-none text-white">
        {{ $t('trade.details') }}
      </p>
      <div class="transition-all" :class="{ 'rotate-180': isOpen }">
        <UIcon :name="NuxtUiIcons.ChevronDown" class="h-3 w-3 min-w-3" />
      </div>
    </div>

    <AppCollapse v-bind="{ isOpen }">
      <div class="py-4 space-y-2">
        <div class="flex items-center text-xs border-b pb-2">
          <p class="text-coolGray-450">{{ $t('trade.total') }}</p>
          <div class="flex-1 mx-2" />

          <p
            class="flex font-mono space-x-2 text-white"
            :data-cy="dataCyTag(SpotMarketCyTags.DetailsTotal)"
          >
            <span class="flex space-x-2">
              <span>&asymp;</span>
              <AppAmount
                v-bind="{
                  amount: totalWithFee.toFixed(),
                  decimalPlaces: UI_DEFAULT_PRICE_DISPLAY_DECIMALS
                }"
              />
            </span>

            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-coolGray-450">{{ $t('trade.amount') }}</p>
          <div class="flex-1 mx-2" />
          <p
            class="font-mono space-x-2 flex"
            :data-cy="dataCyTag(SpotMarketCyTags.DetailsAmount)"
          >
            <AppAmount
              v-bind="{
                amount: quantity.toFixed(),
                decimalPlaces: spotMarket.quantityDecimals
              }"
              class="text-white"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.baseToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-coolGray-450">
            {{ spotMarket.quoteToken.symbol }} {{ $t('trade.amount') }}
          </p>
          <div class="flex-1 mx-2" />
          <p
            class="font-mono space-x-2 flex text-white"
            :data-cy="dataCyTag(SpotMarketCyTags.DetailsStableAmount)"
          >
            <AppAmount
              v-bind="{
                amount: total.toFixed(),
                decimalPlaces: spotMarket.priceDecimals
              }"
              class="text-white"
            />

            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-coolGray-450">{{ $t('trade.price') }}</p>
          <div class="flex-1 mx-2" />
          <p
            class="font-mono space-x-2 flex"
            :data-cy="dataCyTag(SpotMarketCyTags.DetailsPrice)"
          >
            <AppAmount
              v-bind="{
                amount: worstPrice.toFixed(),
                decimalPlaces: spotMarket.priceDecimals
              }"
              class="text-white"
            />
            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div
          v-if="spotFormValues[SpotTradeFormField.Type] !== TradeTypes.Limit"
          class="flex items-center text-xs font-medium"
        >
          <p class="text-coolGray-450">{{ $t('trade.maker_taker_rate') }}</p>
          <div class="flex-1 mx-2" />
          <p
            v-if="spotMarket"
            class="font-mono text-white"
            :data-cy="dataCyTag(SpotMarketCyTags.DetailsMakerTakerRate)"
          >
            {{ makerFeeRateToFixed }}% / {{ takerFeeRateToFixed }}%
          </p>
        </div>

        <template v-else>
          <div class="flex items-center text-xs font-medium">
            <p class="text-coolGray-450">{{ $t('trade.maker_rate') }}</p>
            <div class="flex-1 mx-2" />
            <p
              v-if="spotMarket"
              class="font-mono text-white"
              :data-cy="dataCyTag(SpotMarketCyTags.DetailsMakerFeeRate)"
            >
              {{ makerFeeRateToFixed }}%
            </p>
          </div>

          <div class="flex items-center text-xs font-medium">
            <p class="text-coolGray-450">{{ $t('trade.estFeeRebate') }}</p>
            <div class="flex-1 mx-2" />
            <p
              v-if="spotMarket"
              class="font-mono gap-x-2 flex"
              :data-cy="dataCyTag(SpotMarketCyTags.DetailsEstFeeRebate)"
            >
              <AppAmount
                v-bind="{
                  decimalPlaces: 18,
                  amount: feeAmount.toFixed()
                }"
                class="text-white"
              />
              <span class="text-coolGray-450">USDT</span>
            </p>
          </div>
        </template>
      </div>
    </AppCollapse>
  </div>
</template>
