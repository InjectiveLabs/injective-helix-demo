<template>
  <div v-if="market" class="mt-6 py-6 border-t relative">
    <VDrawer
      :custom-handler="true"
      :custom-is-open="detailsDrawerOpen"
      @set:drawerToggle="onDrawerToggle"
    >
      <div class="mt-4">
        <TextInfo :title="$t('trade.price')" class="mt-2">
          <span
            v-if="executionPrice.gt(0)"
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

        <TextInfo
          :title="
            postOnly ? $t('trade.maker_rate') : $t('trade.maker_taker_rate')
          "
          class="mt-2"
        >
          <IconInfoTooltip
            slot="context"
            class="ml-2"
            :tooltip="
              postOnly
                ? $t('trade.maker_rate_note')
                : $t('trade.maker_taker_rate_note')
            "
          />
          <span class="font-mono flex items-center">
            {{
              postOnly
                ? `${makerFeeRateToFormat}%`
                : `${makerFeeRateToFormat}%/${takerFeeRateToFormat}%`
            }}
          </span>
        </TextInfo>

        <TextInfo :title="$t('trade.fee')" class="mt-2">
          <div slot="context">
            <div class="flex items-start">
              <IconInfoTooltip
                v-if="!orderTypeBuy"
                class="ml-2"
                :tooltip="
                  marketHasNegativeMakerFee
                    ? $t('trade.fee_order_details_note_negative_margin')
                    : $t('trade.fee_order_details_note', {
                        feeReturned: feeReturned.toFixed()
                      })
                "
              />
              <IconInfoTooltip
                v-else
                class="ml-2"
                :tooltip="
                  marketHasNegativeMakerFee
                    ? $t('trade.fee_order_details_note_negative_margin')
                    : $t('trade.fees_tooltip')
                "
              />
              <IconCheckTooltip
                v-if="
                  !marketHasNegativeMakerFee &&
                  (makerFeeRateDiscount.gt(0) || takerFeeRateDiscount.gt(0))
                "
                class="ml-2 text-primary-500"
                :tooltip="
                  $t('trade.fees_tooltip_discount', {
                    maker: makerFeeRateDiscount.times(100).toFixed(),
                    taker: takerFeeRateDiscount.times(100).toFixed()
                  })
                "
              />
            </div>
          </div>

          <span v-if="fees.gt(0)" class="font-mono flex items-start break-all">
            {{ totalEstimatedFees }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </TextInfo>

        <TextInfo
          v-if="marketHasNegativeMakerFee"
          :title="$t('trade.est_fee_rebate')"
          class="mt-2"
        >
          <div slot="context">
            <IconInfoTooltip
              class="ml-2"
              :tooltip="$t('trade.est_fee_rebate_note')"
            />
          </div>
          <span
            v-if="feeRebates.gt(0)"
            class="font-mono flex items-start break-all"
          >
            {{ feeRebatesToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </TextInfo>

        <!-- <TextInfo
          v-if="makerExpectedPts.gte(0) || takerExpectedPts.gte(0)"
          :title="$t('trade.expected_points')"
          class="mt-2"
        >
          <IconInfoTooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('trade.expected_points_note')"
          />
          <span class="font-mono flex items-start break-all">
            {{ expectedPointsToFormat }}
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

export default Vue.extend({
  components: {
    VDrawer: Drawer
  },

  props: {
    executionPriceToFormat: {
      type: String,
      default: undefined
    },

    executionPrice: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    fees: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    feeReturned: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    feeRebates: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    feeRebatesToFormat: {
      type: String,
      required: true
    },

    minimumReceivedAmount: {
      type: Object as PropType<BigNumberInBase>,
      default: undefined
    },

    orderTypeBuy: {
      type: Boolean,
      required: true
    },

    postOnly: {
      type: Boolean,
      required: true
    },

    takerFeeRateToFormat: {
      type: String,
      default: undefined
    },

    makerFeeRateToFormat: {
      type: String,
      default: undefined
    },

    marketHasNegativeMakerFee: {
      type: Boolean,
      required: true
    },

    makerFeeRateDiscount: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    takerFeeRateDiscount: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    totalEstimatedFees: {
      type: String,
      default: undefined
    },

    amount: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    detailsDrawerOpen: {
      type: Boolean,
      required: true
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

      if (!market || !minimumReceivedAmount.isFinite()) {
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
    }
  },

  methods: {
    onDrawerToggle() {
      this.$emit('@set:drawer-toggle')
    }
  }
})
</script>
