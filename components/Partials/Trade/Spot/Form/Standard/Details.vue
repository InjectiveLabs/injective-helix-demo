<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { DEFAULT_ASSET_DECIMALS } from '@shared/utils/constant'
import {
  MarketKey,
  TradeTypes,
  SpotMarketCyTags,
  SpotTradeFormField
} from '@/types'
import type { SpotTradeForm } from '@/types'
import type { BigNumberInBase } from '@injectivelabs/utils'

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
    shouldTruncate: true,
    decimalPlaces: DEFAULT_ASSET_DECIMALS
  }
)

const { valueToFixed: makerFeeRateToFixed } = useSharedBigNumberFormatter(
  computed(() => makerFeeRate.value.times(100)),
  {
    shouldTruncate: true,
    decimalPlaces: DEFAULT_ASSET_DECIMALS
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
        <div class="flex items-center text-xs">
          <p class="text-coolGray-450">{{ $t('trade.total') }}</p>
          <div class="flex-1 mx-2" />

          <p
            class="flex space-x-2 text-white"
            :data-cy="dataCyTag(SpotMarketCyTags.DetailsTotal)"
          >
            <span class="flex space-x-2">
              <span>&asymp;</span>
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  shouldAbbreviate: false,
                  amount: totalWithFee.toFixed()
                }"
              />
            </span>

            <span class="text-coolGray-450">
              {{ spotMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div
          v-if="spotFormValues[SpotTradeFormField.Type] !== TradeTypes.Limit"
          class="flex items-center text-xs font-medium"
        >
          <p class="text-coolGray-450">{{ $t('trade.makerTakerRate') }}</p>
          <div class="flex-1 mx-2" />
          <p
            v-if="spotMarket"
            class="text-white"
            :data-cy="dataCyTag(SpotMarketCyTags.DetailsMakerTakerRate)"
          >
            {{ makerFeeRateToFixed }}% / {{ takerFeeRateToFixed }}%
          </p>
        </div>

        <template v-else>
          <div class="flex items-center text-xs font-medium">
            <p class="text-coolGray-450">{{ $t('trade.makerRate') }}</p>
            <div class="flex-1 mx-2" />
            <p
              v-if="spotMarket"
              class="text-white"
              :data-cy="dataCyTag(SpotMarketCyTags.DetailsMakerFeeRate)"
            >
              {{ makerFeeRateToFixed }}%
            </p>
          </div>
        </template>
      </div>
    </AppCollapse>
  </div>
</template>
