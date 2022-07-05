<template>
  <div v-if="market" class="mt-6 py-6 border-t relative">
    <VDrawer
      :custom-handler="true"
      :custom-is-open="detailsDrawerOpen"
      @drawer-toggle="onDrawerToggle"
    >
      <p slot="header" class="flex justify-between">
        <TextInfo :title="$t('trade.total')" lg>
          <IconInfoTooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('trade.market_total_tooltip')"
          />
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

        <TextInfo :title="$t('trade.averagePrice')" class="mt-2">
          <span
            v-if="!executionPrice.isNaN()"
            class="font-mono flex items-start break-all"
          >
            {{ executionPriceToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </TextInfo>

        <TextInfo
          v-if="!orderTypeReduceOnly && !isBinaryOption"
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

        <TextInfo :title="$t('trade.taker_rate')" class="mt-2">
          <IconInfoTooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('trade.taker_rate_note')"
          />
          <span class="font-mono flex items-center">
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
          <span v-if="fees.gt(0)" class="font-mono flex items-start break-all">
            <span class="mr-1">≈</span>
            {{ feesToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </TextInfo>

        <!-- <TextInfo
          v-if="expectedPts.gte(0)"
          :title="$t('trade.expected_points')"
          class="mt-2"
        >
          <IconInfoTooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('trade.expected_points_note')"
          />
          <span class="font-mono flex items-start break-all">
            {{ `${expectedPtsToFormat}` }}
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
import {
  MarketType,
  UiDerivativeMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import Drawer from '~/components/elements/drawer.vue'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'

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

    takerFeeRate: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    makerFeeRate: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    takerFeeRateToFormat: {
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

    slippage: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    makerExpectedPts: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    takerExpectedPts: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    feesToFormat: {
      type: String,
      required: true
    },

    notionalValue: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    executionPrice: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    executionPriceToFormat: {
      type: String,
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
    }
  },

  computed: {
    market(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    isBinaryOption(): boolean {
      const { market } = this

      if (!market) {
        return false
      }

      return market.subType === MarketType.BinaryOptions
    },

    marketHasNegativeMakerFee(): boolean {
      const { market } = this

      if (!market) {
        return false
      }

      return new BigNumberInBase(market.makerFeeRate).lt(0)
    },

    notionalWithLeverageAndFeesToFormat(): string {
      const { notionalWithLeverageAndFees, market, slippage } = this

      const decimals = market
        ? market.priceDecimals
        : UI_DEFAULT_PRICE_DISPLAY_DECIMALS

      return notionalWithLeverageAndFees
        .times(slippage)
        .toFormat(decimals, BigNumberInBase.ROUND_DOWN)
    },

    liquidationPriceToFormat(): string {
      const { liquidationPrice, market } = this

      const decimals = market
        ? market.priceDecimals
        : UI_DEFAULT_PRICE_DISPLAY_DECIMALS

      return liquidationPrice.toFormat(decimals, BigNumberInBase.ROUND_HALF_UP)
    },

    notionalWithLeverageToFormat(): string {
      const { notionalWithLeverage, market, slippage } = this

      const decimals = market
        ? market.priceDecimals
        : UI_DEFAULT_PRICE_DISPLAY_DECIMALS

      return notionalWithLeverage
        .times(slippage)
        .toFormat(decimals, BigNumberInBase.ROUND_DOWN)
    }
  },

  methods: {
    onDrawerToggle() {
      this.$emit('@set:drawer-toggle')
    }
  }
})
</script>
