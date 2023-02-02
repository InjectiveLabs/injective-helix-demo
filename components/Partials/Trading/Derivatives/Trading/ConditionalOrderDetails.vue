<script lang="ts" setup>
import {
  MarketType,
  UiDerivativeMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { PropType } from 'vue'
import { TradeForm } from '@/types'
import { TRADE_FORM_PRICE_ROUNDING_MODE } from '@/app/utils/constants'

const props = defineProps({
  orderTypeReduceOnly: Boolean,

  formValues: {
    type: Object as PropType<TradeForm>,
    required: true
  },

  liquidationPrice: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  market: {
    type: Object as PropType<UiDerivativeMarketWithToken>,
    required: true
  },

  notionalValue: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const isBinaryOption = computed(
  () => props.market.subType === MarketType.BinaryOptions
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
          <AppTextInfo :title="$t('trade.total')" lg>
            <template #context>
              <AppInfoTooltip
                class="ml-2"
                :tooltip="$t('trade.market_total_tooltip')"
              />
            </template>
            <span
              class="font-mono flex items-start break-all"
              data-cy="trading-page-details-total-text-content"
            >
              <span class="mr-1">≈</span>
              <slot name="total" />
              <span class="text-gray-500 ml-1 break-normal">
                {{ market.quoteToken.symbol }}
              </span>
            </span>
          </AppTextInfo>
        </p>
      </template>

      <div class="mt-4">
        <AppTextInfo
          v-if="!orderTypeReduceOnly && !isBinaryOption"
          :title="$t('trade.liquidation_price')"
          class="mt-2"
        >
          <template #context>
            <AppInfoTooltip
              class="ml-2"
              :tooltip="$t('trade.liquidation_price_tooltip')"
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
        </AppTextInfo>

        <AppTextInfo
          v-if="!orderTypeReduceOnly"
          :title="$t('trade.margin')"
          class="mt-2"
        >
          <template #context>
            <AppInfoTooltip
              class="ml-2"
              :tooltip="$t('trade.margin_tooltip')"
            />
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
        </AppTextInfo>

        <slot name="makerTakerFeeRate" />
      </div>
    </AppDrawer>
  </div>
</template>
