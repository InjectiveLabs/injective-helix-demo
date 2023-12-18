<script lang="ts" setup>
import { PropType, Ref } from 'vue'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { TradeForm, UiMarketWithToken } from '@/types'

const formValues = useFormValues() as Ref<TradeForm>

defineProps({
  isBuy: Boolean,

  executionPrice: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  minimumReceivedAmount: {
    type: Object as PropType<BigNumberInBase>,
    default: ZERO_IN_BASE
  }
})

const { tradingTypeMarket } = useSpotFormFormatter(formValues)
</script>

<template>
  <div class="pt-6 border-t relative">
    <AppDrawer>
      <template #header>
        <p class="flex justify-between text-sm">
          <CommonTextInfo :title="$t('trade.total')" is-lg>
            <template v-if="tradingTypeMarket" #context>
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
          v-if="tradingTypeMarket"
          class="mt-2"
          :title="$t('trade.amount')"
        >
          <template #context>
            <AppTooltip
              class="ml-2"
              :content="$t('trade.min_received_amount')"
            />
          </template>

          <span
            v-if="minimumReceivedAmount.gt(0)"
            data-cy="trading-page-details-minimum-amount-text-content"
            class="font-mono flex items-start break-all"
          >
            <slot name="marketMinimumReceivedAmount" />

            <span class="text-gray-500 ml-1 break-normal">
              {{ isBuy ? market.baseToken.symbol : market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </CommonTextInfo>

        <CommonTextInfo :title="$t('trade.price')" class="mt-2">
          <span
            v-if="executionPrice.gt(0)"
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

        <slot name="makerTakerFeeRate" />
        <slot name="feeRate" />
        <slot v-if="!tradingTypeMarket" name="feeRebate" />
        <slot name="expectedPts" />
      </div>
    </AppDrawer>
  </div>
</template>
