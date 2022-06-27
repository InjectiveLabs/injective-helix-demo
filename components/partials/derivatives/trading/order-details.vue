<template>
  <div v-if="market" class="mt-6 py-6 border-t relative">
    <VDrawer
      :custom-handler="true"
      :custom-is-open="detailsDrawerOpen"
      @drawer-toggle="onDrawerToggle"
    >
      <p slot="header" class="flex justify-between text-sm">
        <TextInfo :title="$t('trade.total')" lg>
          <span class="font-mono flex items-start break-all">
            <span class="mr-1">≈</span>
            {{ notionalWithLeverageAndFeesToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
        </TextInfo>
      </p>

      <div class="mt-4">
        <TextInfo
          v-if="!orderTypeReduceOnly"
          :title="$t('trade.liquidation_price')"
          class="mt-2"
        >
          <IconInfoTooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('trade.liquidation_price_tooltip')"
          />
          <span
            v-if="liquidationPrice.gt(0)"
            class="font-mono flex items-start break-all"
          >
            {{ liquidationPriceToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </TextInfo>

        <TextInfo
          v-if="!orderTypeReduceOnly"
          :title="$t('trade.margin')"
          class="mt-2"
        >
          <IconInfoTooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('trade.margin_tooltip')"
          />
          <span
            v-if="notionalWithLeverage.gt(0)"
            class="font-mono flex items-start break-all"
          >
            {{ notionalWithLeverageToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
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
            <div class="flex items-center">
              <IconInfoTooltip
                slot="context"
                class="ml-2"
                :tooltip="
                  marketHasNegativeMakerFee
                    ? $t('trade.fee_order_details_note_negative_margin')
                    : $t('trade.fee_order_details_note', {
                        feeReturned: feeReturned.toFixed()
                      })
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
            {{ feesToFormat }}
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
          <IconInfoTooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('trade.est_fee_rebate_note')"
          />
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
import { UiDerivativeMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import Drawer from '~/components/elements/drawer.vue'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'
import { Icon } from '~/types'
import { TradingRewardsCampaign } from '~/app/client/types/exchange'

export default Vue.extend({
  components: {
    VDrawer: Drawer
  },

  props: {
    notionalWithLeverageAndFees: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    liquidationPrice: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    takerFeeRateDiscount: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    makerFeeRateDiscount: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    takerFeeRateToFormat: {
      type: String,
      required: true
    },

    expectedPointsToFormat: {
      type: String,
      required: true
    },

    makerFeeRateToFormat: {
      type: String,
      required: true
    },

    feeRebatesToFormat: {
      type: String,
      required: true
    },

    notionalWithLeverage: {
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

    feesToFormat: {
      type: String,
      required: true
    },

    marketHasNegativeMakerFee: {
      type: Boolean,
      required: true
    },

    executionPrice: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    amount: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    orderTypeReduceOnly: {
      type: Boolean,
      required: true
    },

    detailsDrawerOpen: {
      type: Boolean,
      required: true
    },

    postOnly: {
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
    market(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    tradingRewardsCampaign(): TradingRewardsCampaign | undefined {
      return this.$accessor.exchange.tradingRewardsCampaign
    },

    notionalWithLeverageAndFeesToFormat(): string {
      const { notionalWithLeverageAndFees, market } = this

      if (!market) {
        return notionalWithLeverageAndFees.toFormat(
          UI_DEFAULT_PRICE_DISPLAY_DECIMALS
        )
      }

      return notionalWithLeverageAndFees.toFormat(market.priceDecimals)
    },

    notionalWithLeverageToFormat(): string {
      const { notionalWithLeverage, market } = this

      if (!market) {
        return notionalWithLeverage.toFormat(
          UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
          BigNumberInBase.ROUND_DOWN
        )
      }

      return notionalWithLeverage.toFormat(
        market.priceDecimals,
        BigNumberInBase.ROUND_DOWN
      )
    },

    liquidationPriceToFormat(): string {
      const { liquidationPrice, market } = this

      if (!market) {
        return liquidationPrice.toFormat(
          UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
          BigNumberInBase.ROUND_HALF_UP
        )
      }

      return liquidationPrice.toFormat(
        market.priceDecimals,
        BigNumberInBase.ROUND_HALF_UP
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
