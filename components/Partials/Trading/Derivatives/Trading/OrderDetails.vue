<script lang="ts" setup>
import { PropType, Ref } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { TradeForm, UiMarketWithToken } from '@/types'
import { TRADE_FORM_PRICE_ROUNDING_MODE } from '@/app/utils/constants'

const formValues = useFormValues() as Ref<TradeForm>

const props = defineProps({
  orderTypeReduceOnly: Boolean,

  executionPrice: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  liquidationPrice: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  notionalValue: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const { tradingTypeMarket } = useDerivativeFormFormatter(formValues)

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
        <p class="flex justify-between text-sm">
          <CommonTextInfo :title="$t('trade.total')" lg>
            <template v-if="tradingTypeMarket" #context>
              <CommonInfoTooltip
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
          </CommonTextInfo>
        </p>
      </template>

      <div class="mt-4">
        <CommonTextInfo
          v-if="tradingTypeMarket"
          :title="$t('trade.averagePrice')"
          class="mt-2"
        >
          <span
            v-if="!executionPrice.isNaN()"
            data-cy="trading-page-details-execution-price-text-content"
            class="font-mono flex items-start break-all"
          >
            <slot name="executionPrice" />
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </CommonTextInfo>

        <CommonTextInfo
          v-if="!orderTypeReduceOnly && !isBinaryOption"
          :title="$t('trade.liquidation_price')"
          class="mt-2"
        >
          <template #context>
            <CommonInfoTooltip
              class="ml-2"
              :tooltip="$t('trade.liquidation_price_tooltip')"
            />
          </template>
          <span
            v-if="liquidationPrice && liquidationPrice.gt(0)"
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
          v-if="!orderTypeReduceOnly"
          :title="$t('trade.margin')"
          class="mt-2"
        >
          <template #context>
            <CommonInfoTooltip
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
        </CommonTextInfo>

        <slot name="makerTakerFeeRate" />
        <slot name="feeRate" />
        <slot name="feeRebate" />
      </div>
    </AppDrawer>
  </div>
</template>
