<template>
  <div v-if="market" class="mt-6 py-6 border-t relative">
    <VDrawer
      :custom-handler="true"
      :custom-is-open="detailsDrawerOpen"
      @drawer-toggle="onDrawerToggle"
    >
      <p slot="header" class="flex justify-between text-sm">
        <TextInfo :title="$t('trade.details')" lg />
      </p>
      <div class="mt-4">
        <TextInfo :title="$t('trade.averagePrice')" class="mt-2">
          <span
            v-if="!executionPrice.isNaN()"
            data-cy="trading-page-details-execution-price-text-content"
            class="font-mono flex items-start break-all"
          >
            {{ executionPriceToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </TextInfo>
        <TextInfo class="mt-2" :title="$t('trade.min_received_amount')">
          <span
            v-if="minimumReceivedAmount.gt(0)"
            data-cy="trading-page-details-minimum-amount-text-content"
            class="font-mono flex items-start break-all"
          >
            {{ minimumReceivedAmountToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{
                orderTypeBuy
                  ? market.baseToken.symbol
                  : market.quoteToken.symbol
              }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </TextInfo>

        <TextInfo :title="$t('trade.taker_rate')" class="mt-2">
          <IconInfoTooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('trade.taker_rate_note')"
          />
          <span
            class="font-mono flex items-center"
            data-cy="trading-page-details-taker-fee-percentage-text-content"
          >
            {{ `${takerFeeRateToFormat}%` }}
          </span>
        </TextInfo>

        <TextInfo :title="$t('trade.fee')" class="mt-2">
          <div slot="context">
            <div class="flex items-center">
              <IconInfoTooltip
                slot="context"
                class="ml-2"
                :tooltip="$t('trade.fees_tooltip')"
              />
              <IconCheckTooltip
                v-if="takerFeeRateDiscount.gt(0)"
                class="ml-2 text-primary-500"
                :tooltip="
                  $t('trade.fees_tooltip_discount', {
                    taker: takerFeeRateDiscount.times(100).toFixed()
                  })
                "
              />
            </div>
          </div>
          <span
            v-if="fees.gt(0)"
            class="font-mono flex items-start break-all"
            data-cy="trading-page-details-fee-value-text-content"
          >
            <span class="mr-1">≈</span>
            {{ feesToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </TextInfo>

        <!-- <TextInfo
          v-if="takerExpectedPts.gte(0)"
          :title="$t('trade.expected_points')"
          class="mt-2"
        >
          <IconInfoTooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('trade.expected_points_note')"
          />
          <span class="font-mono flex items-start break-all">
            {{ `${takerExpectedPtsToFormat}` }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ $t('pts') }}
            </span>
          </span>
        </TextInfo> -->
      </div>
    </VDrawer>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import Drawer from '~/components/elements/drawer.vue'
import { Icon } from '~/types'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    VDrawer: Drawer
  },

  props: {
    detailsDrawerOpen: {
      required: true,
      type: Boolean
    },

    executionPriceToFormat: {
      type: String,
      default: undefined
    },

    executionPrice: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    fees: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    minimumReceivedAmount: {
      type: Object as PropType<BigNumberInBase>,
      default: undefined
    },

    orderTypeBuy: {
      required: true,
      type: Boolean
    },

    feesToFormat: {
      type: String,
      default: undefined
    },

    takerFeeRateToFormat: {
      type: String,
      default: undefined
    },

    marketHasNegativeMakerFee: {
      required: true,
      type: Boolean
    },

    makerFeeRateDiscount: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    takerFeeRateDiscount: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    amount: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    notionalValue: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    }
  },

  data() {
    return {
      Icon
    }
  },

  computed: {
    market(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    minimumReceivedAmountToFormat(): string | undefined {
      const { market, orderTypeBuy, minimumReceivedAmount } = this

      if (!market) {
        return
      }

      return orderTypeBuy
        ? minimumReceivedAmount.toFormat(
            market.quantityDecimals,
            BigNumberInBase.ROUND_DOWN
          )
        : minimumReceivedAmount.toFormat(
            market.priceDecimals,
            BigNumberInBase.ROUND_DOWN
          )
    },

    notionalValueToFormat(): string {
      const { notionalValue, market } = this

      if (!market) {
        return notionalValue.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return notionalValue.toFormat(market.priceDecimals)
    }
  },

  methods: {
    onDrawerToggle() {
      this.$emit('set:drawer-toggle')
    }
  }
})
</script>
