<template>
  <div v-if="market" class="pt-6 border-t relative">
    <Drawer
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
          <span
            class="font-mono flex items-start break-all"
            data-cy="trading-page-details-total-text-content"
          >
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
            data-cy="trading-page-details-liquidation-price-text-content"
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
            data-cy="trading-page-details-notional-value-text-content"
            class="font-mono flex items-start break-all"
          >
            {{ notionalWithLeverageToFormat }}
            <span class="text-gray-500 ml-1 break-normal">
              {{ market.quoteToken.symbol }}
            </span>
          </span>
          <span v-else class="text-gray-500 ml-1"> &mdash; </span>
        </TextInfo>

        <TextInfo :title="$t('trade.maker_taker_rate')" class="mt-2">
          <IconInfoTooltip
            slot="context"
            class="ml-2"
            :tooltip="$t('trade.maker_taker_rate_note')"
          />
          <span
            class="font-mono flex items-center"
            data-cy="trading-page-details-fee-percentage-text-content"
          >
            {{ `${makerFeeRateToFormat}%/${takerFeeRateToFormat}%` }}
          </span>
        </TextInfo>
      </div>
    </Drawer>
  </div>
</template>

<script lang="ts">
import {
  MarketType,
  UiDerivativeMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import Vue, { PropType } from 'vue'
import Drawer from '~/components/elements/drawer.vue'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    Drawer
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

    makerFeeRateToFormat: {
      type: String,
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

    notionalWithLeverageAndFeesToFormat(): string {
      const { notionalWithLeverageAndFees, market } = this

      if (!market) {
        return notionalWithLeverageAndFees.toFormat(
          UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
          BigNumberInBase.ROUND_DOWN
        )
      }

      return notionalWithLeverageAndFees.toFormat(
        market.priceDecimals,
        BigNumberInBase.ROUND_DOWN
      )
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
      this.$emit('set:drawer-toggle')
    }
  }
})
</script>
