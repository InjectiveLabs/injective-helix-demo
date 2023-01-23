<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { TradeForm, UiMarketWithToken } from '@/types'
import { TRADE_FORM_PRICE_ROUNDING_MODE } from '@/app/utils/constants'

const props = defineProps({
  orderTypeReduceOnly: Boolean,

  executionPrice: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  formValues: {
    type: Object as PropType<TradeForm>,
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

  // minimumReceivedAmount: {
  //   type: Object as PropType<BigNumberInBase>,
  //   default: ZERO_IN_BASE
  // },

  notionalValue: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const { tradingTypeMarket } = useDerivativeFormFormatter(
  computed(() => props.formValues)
)

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
          <AppTextInfo :title="$t('trade.total')" lg>
            <template v-if="tradingTypeMarket" #context>
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
        <!-- TODO: remove this if product gives the go ahead since is always - for perp markets-->
        <!-- <AppTextInfo
          v-if="tradingTypeMarket"
          :title="$t('trade.amount')"
          class="mt-2"
        >
          <template #context>
            <AppInfoTooltip
              class="ml-2"
              :tooltip="$t('trade.min_received_amount')"
            />
          </template>
          <span
            v-if="minimumReceivedAmount.gt(0)"
            data-cy="trading-page-details-execution-price-text-content"
            class="font-mono flex items-start break-all"
          >
            <slot v-if="false" name="marketMinimumReceivedAmount" />
            <span v-else class="ml-1"> &mdash; </span>
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="ml-1"> &mdash; </span>
        </AppTextInfo> -->

        <AppTextInfo
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
        </AppTextInfo>

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
        <slot name="feeRate" />
        <slot name="feeRebate" />
      </div>
    </AppDrawer>
  </div>
</template>
