<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  MarketKey,
  DerivativeTradeTypes,
  PerpetualMarketCyTags,
  DerivativesTradeFormField
} from '@/types'
import type { BigNumberInBase } from '@injectivelabs/utils'
import type { UiDerivativeMarket, DerivativesTradeForm } from '@/types'

const derivativeMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

withDefaults(
  defineProps<{
    margin: BigNumberInBase
    quantity: BigNumberInBase
    feeAmount: BigNumberInBase
    worstPrice: BigNumberInBase
    totalNotional: BigNumberInBase
    marginWithFee: BigNumberInBase
    estLiquidationPrice: BigNumberInBase
  }>(),
  {}
)

const isOpen = ref(true)
const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const { makerFeeRate, takerFeeRate } = useTradeFee({
  marketTakerFeeRate: derivativeMarket?.value?.takerFeeRate,
  marketMakerFeeRate: derivativeMarket?.value?.makerFeeRate
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

const isLimitAndPostOnly = computed(
  () =>
    (derivativeFormValues.value[DerivativesTradeFormField.PostOnly] &&
      derivativeFormValues.value[DerivativesTradeFormField.Type] ===
        DerivativeTradeTypes.Limit) ||
    derivativeFormValues.value[DerivativesTradeFormField.Type] ===
      DerivativeTradeTypes.StopLimit
)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div v-if="derivativeMarket" class="mb-4">
    <div
      class="flex items-center justify-between cursor-pointer select-none text-white"
      @click="toggle"
    >
      <p class="text-xs font-semibold select-none">{{ $t('trade.details') }}</p>
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
            class="space-x-2 flex text-white"
            :data-cy="dataCyTag(PerpetualMarketCyTags.DetailsTotal)"
          >
            <span class="flex space-x-2">
              <span>&asymp;</span>

              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  shouldAbbreviate: false,
                  amount: marginWithFee.toFixed()
                }"
              />
            </span>

            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-coolGray-450">{{ $t('trade.margin') }}</p>
          <div class="flex-1 mx-2" />
          <p class="space-x-2">
            <SharedAmount
              :data-cy="dataCyTag(PerpetualMarketCyTags.DetailsMargin)"
              v-bind="{
                useSubscript: true,
                shouldAbbreviate: false,
                amount: margin.toFixed()
              }"
              class="text-white"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-coolGray-450">{{ $t('trade.totalNotional') }}</p>
          <div class="flex-1 mx-2" />
          <p class="space-x-2 flex">
            <SharedAmount
              :data-cy="dataCyTag(PerpetualMarketCyTags.DetailsTotalNotional)"
              v-bind="{
                useSubscript: true,
                shouldAbbreviate: false,
                amount: totalNotional.toFixed(),
                decimals: derivativeMarket.priceDecimals
              }"
              class="text-white"
            />
            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-coolGray-450">{{ $t('trade.quantity') }}</p>
          <div class="flex-1 mx-2" />
          <p class="space-x-2">
            <SharedAmount
              :data-cy="dataCyTag(PerpetualMarketCyTags.DetailsQty)"
              v-bind="{
                useSubscript: true,
                shouldAbbreviate: false,
                amount: quantity.toFixed()
              }"
              class="text-white"
            />
            <span class="text-coolGray-450">
              {{
                derivativeMarket.baseToken.overrideSymbol ||
                derivativeMarket.baseToken.symbol
              }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-coolGray-450">
            {{ $t('trade.averagePrice') }}
          </p>
          <div class="flex-1 mx-2" />
          <p class="space-x-2 flex">
            <SharedAmount
              :data-cy="dataCyTag(PerpetualMarketCyTags.DetailsAvgPrice)"
              v-bind="{
                useSubscript: true,
                shouldAbbreviate: false,
                amount: worstPrice.toFixed(),
                decimals: derivativeMarket.priceDecimals
              }"
              class="text-white"
            />

            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-coolGray-450">{{ $t('trade.estLiquidationPrice') }}</p>
          <div class="flex-1 mx-2" />
          <p class="space-x-2 flex">
            <SharedAmount
              :data-cy="
                dataCyTag(PerpetualMarketCyTags.DetailsEstLiquidationPrice)
              "
              v-bind="{
                useSubscript: true,
                shouldAbbreviate: false,
                amount: estLiquidationPrice.toFixed(),
                decimals: derivativeMarket.priceDecimals
              }"
              class="text-white"
            />

            <span class="text-coolGray-450">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <template v-if="!isLimitAndPostOnly">
          <div class="flex items-center text-xs font-medium">
            <p class="text-coolGray-450">{{ $t('trade.makerTakerRate') }}</p>
            <div class="flex-1 mx-2" />
            <p
              v-if="derivativeMarket"
              class="text-white"
              :data-cy="dataCyTag(PerpetualMarketCyTags.DetailsMakerTakerRate)"
            >
              {{ makerFeeRateToFixed }}% / {{ takerFeeRateToFixed }}%
            </p>
          </div>

          <div class="flex items-center text-xs font-medium">
            <p class="text-coolGray-450">{{ $t('trade.fee') }}</p>
            <div class="flex-1 mx-2" />
            <p class="space-x-2 flex">
              <SharedAmount
                :data-cy="dataCyTag(PerpetualMarketCyTags.DetailsFee)"
                v-bind="{
                  useSubscript: true,
                  shouldAbbreviate: false,
                  amount: feeAmount.toFixed()
                }"
                class="text-white"
              />
              <span class="text-coolGray-450">
                {{ derivativeMarket.quoteToken.symbol }}
              </span>
            </p>
          </div>
        </template>

        <template v-else>
          <div class="flex items-center text-xs font-medium">
            <p class="text-coolGray-450">{{ $t('trade.makerRate') }}</p>
            <div class="flex-1 mx-2" />
            <p v-if="derivativeMarket" class="text-white">
              {{ makerFeeRateToFixed }}%
            </p>
          </div>

          <div class="flex items-center text-xs font-medium">
            <p class="text-coolGray-450">{{ $t('trade.estFeeRebate') }}</p>
            <div class="flex-1 mx-2" />
            <p v-if="derivativeMarket" class="flex gap-x-2">
              <SharedAmount
                v-bind="{
                  useSubscript: true,
                  shouldAbbreviate: false,
                  amount: feeAmount.toFixed()
                }"
                class="text-white"
              />
              {{ derivativeMarket.quoteToken.symbol }}
            </p>
          </div>
        </template>
      </div>
    </AppCollapse>
  </div>
</template>
