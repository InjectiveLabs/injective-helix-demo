<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { OrderSide, TradeDirection } from '@injectivelabs/ts-types'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { calculateLiquidationPrice } from '@/app/client/utils/derivatives'
import {
  MarketKey,
  UiDerivativeMarket,
  DerivativeTradeTypes,
  DerivativesTradeForm,
  DerivativesTradeFormField,
  PerpetualmarketCyTags
} from '@/types'

const derivativeMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

const props = withDefaults(
  defineProps<{
    margin: BigNumberInBase
    totalNotional: BigNumberInBase
    worstPrice: BigNumberInBase
    feeAmount: BigNumberInBase
    marginWithFee: BigNumberInBase
    quantity: BigNumberInBase
  }>(),
  {}
)

const isOpen = ref(true)
const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const isLimitAndPostOnly = computed(
  () =>
    (derivativeFormValues.value[DerivativesTradeFormField.PostOnly] &&
      derivativeFormValues.value[DerivativesTradeFormField.Type] ===
        DerivativeTradeTypes.Limit) ||
    derivativeFormValues.value[DerivativesTradeFormField.Type] ===
      DerivativeTradeTypes.StopLimit
)

const estLiquidationPrice = computed(() => {
  const isBuy =
    derivativeFormValues.value[DerivativesTradeFormField.Side] ===
    TradeDirection.Long

  return calculateLiquidationPrice({
    price: props.worstPrice.toFixed(),
    quantity: props.quantity.toFixed(),
    notionalWithLeverage: props.margin.toFixed(),
    orderType: isBuy ? OrderSide.Buy : OrderSide.Sell,
    market: derivativeMarket.value
  })
})

const { valueToString: totalToString } = useSharedBigNumberFormatter(
  computed(() => props.marginWithFee),
  {
    decimalPlaces: UI_DEFAULT_PRICE_DISPLAY_DECIMALS
  }
)

const { valueToString: marginToString } = useSharedBigNumberFormatter(
  computed(() => props.margin),
  {
    decimalPlaces: UI_DEFAULT_PRICE_DISPLAY_DECIMALS
  }
)

const { valueToString: quantityToString } = useSharedBigNumberFormatter(
  computed(() => props.quantity),
  { decimalPlaces: 4 }
)

const { valueToString: worstPriceToString } = useSharedBigNumberFormatter(
  computed(() => props.worstPrice),
  {
    decimalPlaces: UI_DEFAULT_PRICE_DISPLAY_DECIMALS
  }
)

const { valueToString: feeAmountToString } = useSharedBigNumberFormatter(
  computed(() => props.feeAmount.abs().toFixed()),
  {
    decimalPlaces: UI_DEFAULT_PRICE_DISPLAY_DECIMALS
  }
)

const { valueToString: estLiquidationPriceToString } =
  useSharedBigNumberFormatter(
    computed(() => estLiquidationPrice.value),
    {
      decimalPlaces: derivativeMarket.value.priceDecimals
    }
  )

const { valueToString: totalNotionalToString } = useSharedBigNumberFormatter(
  computed(() => props.totalNotional),
  {
    decimalPlaces: derivativeMarket.value.priceDecimals
  }
)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div v-if="derivativeMarket" class="mb-4">
    <div
      class="flex items-center justify-between cursor-pointer select-none"
      @click="toggle"
    >
      <p class="text-sm font-semibold select-none">Details</p>
      <div class="transition-all" :class="{ 'rotate-180': isOpen }">
        <SharedIcon name="chevron-down" is-sm />
      </div>
    </div>

    <AppCollapse v-bind="{ isOpen }">
      <div class="py-4 space-y-2">
        <div class="flex items-center text-lg">
          <p class="text-gray-100">{{ $t('trade.total') }}</p>
          <div class="border-t flex-1 mx-2" />

          <p class="font-mono space-x-2">
            <span :data-cy="dataCyTag(PerpetualmarketCyTags.DetailsTotal)">
              &asymp;{{ totalToString }}
            </span>
            <span class="text-gray-400">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-gray-400">{{ $t('trade.margin') }}</p>
          <div class="border-t flex-1 mx-2" />
          <p class="font-mono space-x-2">
            <span :data-cy="dataCyTag(PerpetualmarketCyTags.DetailsMargin)">
              {{ marginToString }}
            </span>
            <span class="text-gray-400">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-gray-400">{{ $t('trade.totalNotional') }}</p>
          <div class="border-t flex-1 mx-2" />
          <p class="font-mono space-x-2">
            <span
              :data-cy="dataCyTag(PerpetualmarketCyTags.DetailsTotalNotional)"
            >
              {{ totalNotionalToString }}
            </span>
            <span class="text-gray-400">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-gray-400">{{ $t('trade.quantity') }}</p>
          <div class="border-t flex-1 mx-2" />
          <p class="font-mono space-x-2">
            <span :data-cy="dataCyTag(PerpetualmarketCyTags.DetailsQty)">
              {{ quantityToString }}
            </span>
            <span class="text-gray-400">
              {{ derivativeMarket.baseToken.overrideSymbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-gray-400">
            {{ $t('trade.averagePrice') }}
          </p>
          <div class="border-t flex-1 mx-2" />
          <p class="font-mono space-x-2">
            <span :data-cy="dataCyTag(PerpetualmarketCyTags.DetailsAvgPrice)">
              {{ worstPriceToString }}
            </span>
            <span class="text-gray-400">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <div class="flex items-center text-xs font-medium">
          <p class="text-gray-400">{{ $t('trade.estLiquidationPrice') }}</p>
          <div class="border-t flex-1 mx-2" />
          <p class="font-mono space-x-2">
            <span
              :data-cy="
                dataCyTag(PerpetualmarketCyTags.DetailsEstLiquidationPrice)
              "
            >
              {{ estLiquidationPriceToString }}
            </span>
            <span class="text-gray-400">
              {{ derivativeMarket.quoteToken.symbol }}
            </span>
          </p>
        </div>

        <template v-if="!isLimitAndPostOnly">
          <div class="flex items-center text-xs font-medium">
            <p class="text-gray-400">{{ $t('trade.maker_taker_rate') }}</p>
            <div class="border-t flex-1 mx-2" />
            <p
              v-if="derivativeMarket"
              class="font-mono"
              :data-cy="dataCyTag(PerpetualmarketCyTags.DetailsMakerTakerRate)"
            >
              {{ +derivativeMarket.makerFeeRate * 100 }}% /
              {{ +derivativeMarket.takerFeeRate * 100 }}%
            </p>
          </div>

          <div class="flex items-center text-xs font-medium">
            <p class="text-gray-400">{{ $t('trade.fee') }}</p>
            <div class="border-t flex-1 mx-2" />
            <p class="font-mono space-x-2">
              <span :data-cy="dataCyTag(PerpetualmarketCyTags.DetailsFee)">
                {{ feeAmountToString }}
              </span>
              <span class="text-gray-400">
                {{ derivativeMarket.quoteToken.symbol }}
              </span>
            </p>
          </div>
        </template>

        <template v-else>
          <div class="flex items-center text-xs font-medium">
            <p class="text-gray-400">{{ $t('trade.maker_rate') }}</p>
            <div class="border-t flex-1 mx-2" />
            <p v-if="derivativeMarket" class="font-mono">
              {{ +derivativeMarket.makerFeeRate * 100 }}%
            </p>
          </div>

          <div class="flex items-center text-xs font-medium">
            <p class="text-gray-400">{{ $t('trade.estFeeRebate') }}</p>
            <div class="border-t flex-1 mx-2" />
            <p v-if="derivativeMarket" class="font-mono">
              {{ feeAmount.abs() }}
              {{ derivativeMarket.quoteToken.symbol }}
            </p>
          </div>
        </template>
      </div>
    </AppCollapse>
  </div>
</template>
