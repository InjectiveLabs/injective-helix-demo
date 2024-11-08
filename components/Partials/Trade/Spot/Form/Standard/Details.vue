<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { BigNumberInBase } from '@injectivelabs/utils'
import { NuxtUiIcons } from '@shared/types'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '@/app/utils/constants'
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
      <p class="text-sm font-semibold select-none">{{ $t('trade.details') }}</p>
      <div class="transition-all" :class="{ 'rotate-180': isOpen }">
        <UIcon :name="NuxtUiIcons.ChevronDown" class="h-3 w-3 min-w-3" />
      </div>
    </div>

    <AppCollapse v-bind="{ isOpen }">
      <div class="py-4 space-y-2">
        <div class="flex items-center text-lg">
          <p class="text-coolGray-100">{{ $t('trade.total') }}</p>
          <div class="border-t flex-1 mx-2" />

          <p
            class="flex font-mono space-x-2"
            :data-cy="dataCyTag(SpotMarketCyTags.DetailsTotal)"
          >
            <span class="flex">
              <span>&asymp;</span>
              <AppAmount
                v-bind="{
                  amount: totalWithFee.toFixed(),
                  decimalPlaces: UI_DEFAULT_PRICE_DISPLAY_DECIMALS
                }"
              />
            </span>

            <span class="text-coolGray-400">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-coolGray-400">{{ $t('trade.amount') }}</p>
          <div class="border-t flex-1 mx-2" />
          <p
            class="font-mono space-x-2 flex"
            :data-cy="dataCyTag(SpotMarketCyTags.DetailsAmount)"
          >
            <AppAmount
              v-bind="{
                amount: quantity.toFixed(),
                decimalPlaces: spotMarket.quantityDecimals
              }"
            />
            <span class="text-coolGray-400">
              {{ spotMarket.baseToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-coolGray-400">
            {{ spotMarket.quoteToken.symbol }} {{ $t('trade.amount') }}
          </p>
          <div class="border-t flex-1 mx-2" />
          <p
            class="font-mono space-x-2 flex"
            :data-cy="dataCyTag(SpotMarketCyTags.DetailsStableAmount)"
          >
            <AppAmount
              v-bind="{
                amount: total.toFixed(),
                decimalPlaces: spotMarket.priceDecimals
              }"
            />

            <span class="text-coolGray-400">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-coolGray-400">{{ $t('trade.price') }}</p>
          <div class="border-t flex-1 mx-2" />
          <p
            class="font-mono space-x-2 flex"
            :data-cy="dataCyTag(SpotMarketCyTags.DetailsPrice)"
          >
            <AppAmount
              v-bind="{
                amount: worstPrice.toFixed(),
                decimalPlaces: spotMarket.priceDecimals
              }"
            />
            <span class="text-coolGray-400">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div
          v-if="spotFormValues[SpotTradeFormField.Type] !== TradeTypes.Limit"
          class="flex items-center text-xs font-medium"
        >
          <p class="text-coolGray-400">{{ $t('trade.maker_taker_rate') }}</p>
          <div class="border-t flex-1 mx-2" />
          <p
            v-if="spotMarket"
            class="font-mono"
            :data-cy="dataCyTag(SpotMarketCyTags.DetailsMakerTakerRate)"
          >
            {{ +spotMarket.makerFeeRate * 100 }}% /
            {{ +spotMarket.takerFeeRate * 100 }}%
          </p>
        </div>

        <template v-else>
          <div class="flex items-center text-xs font-medium">
            <p class="text-coolGray-400">{{ $t('trade.maker_rate') }}</p>
            <div class="border-t flex-1 mx-2" />
            <p
              v-if="spotMarket"
              class="font-mono"
              :data-cy="dataCyTag(SpotMarketCyTags.DetailsMakerFeeRate)"
            >
              {{ +spotMarket.makerFeeRate * 100 }}%
            </p>
          </div>

          <div class="flex items-center text-xs font-medium">
            <p class="text-coolGray-400">{{ $t('trade.estFeeRebate') }}</p>
            <div class="border-t flex-1 mx-2" />
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
              />
              <span>USDT</span>
            </p>
          </div>
        </template>
      </div>
    </AppCollapse>
  </div>
</template>
