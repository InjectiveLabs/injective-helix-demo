<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { SharedMarketType, SharedUiDerivativeMarket } from '@shared/types'
import { TRADE_FORM_PRICE_ROUNDING_MODE } from '@/app/utils/constants'

const props = defineProps({
  isOrderTypeReduceOnly: Boolean,

  liquidationPrice: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  market: {
    type: Object as PropType<SharedUiDerivativeMarket>,
    required: true
  },

  notionalValue: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const isBinaryOption = computed(
  () => props.market.subType === SharedMarketType.BinaryOptions
)

const { valueToString: notionalValueToFormat } = useBigNumberFormatter(
  computed(() => props.notionalValue),
  {
    decimalPlaces: props.market.priceDecimals
  }
)

const { valueToString: liquidationPriceToFormat } = useBigNumberFormatter(
  computed(() => props.liquidationPrice),
  {
    decimalPlaces: props.market.priceDecimals,
    roundingMode: TRADE_FORM_PRICE_ROUNDING_MODE
  }
)
</script>

<template>
  <div class="pt-6 border-t relative">
    <AppDrawer>
      <template #header>
        <p class="flex justify-between">
          <CommonTextInfo :title="$t('trade.total')" is-lg>
            <template #context>
              <AppTooltip
                class="ml-2"
                :content="$t('trade.market_total_tooltip')"
              />
            </template>
            <span
              class="font-mono flex items-start break-all"
              data-cy="trading-page-details-total-text-content"
            >
              <span class="mr-1">≈</span>
              <slot name="total" />
            </span>
          </CommonTextInfo>
        </p>
      </template>

      <div class="mt-4">
        <CommonTextInfo
          v-if="!isOrderTypeReduceOnly && !isBinaryOption"
          :title="$t('trade.liquidation_price')"
          class="mt-2"
        >
          <template #context>
            <AppTooltip
              class="ml-2"
              :content="$t('trade.liquidation_price_tooltip')"
            />
          </template>

          <span
            v-if="liquidationPrice.gt(0)"
            data-cy="trading-page-details-liquidation-price-text-content"
            class="font-mono flex items-start break-all"
          >
            {{ liquidationPriceToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </CommonTextInfo>

        <CommonTextInfo
          v-if="!isOrderTypeReduceOnly"
          :title="$t('trade.margin')"
          class="mt-2"
        >
          <template #context>
            <AppTooltip class="ml-2" :content="$t('trade.margin_tooltip')" />
          </template>
          <span
            v-if="notionalValue.gt(0)"
            data-cy="trading-page-details-notional-value-text-content"
            class="font-mono flex items-start break-all"
          >
            {{ notionalValueToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </CommonTextInfo>

        <slot name="makerTakerFeeRate" />
      </div>
    </AppDrawer>
  </div>
</template>
