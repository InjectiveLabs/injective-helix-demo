<template>
  <div v-if="market" class="pt-6 border-t relative">
    <Drawer
      :custom-handler="true"
      :custom-is-open="detailsDrawerOpen"
      @drawer-toggle="onDrawerToggle"
    >
      <p slot="header" class="flex justify-between text-sm">
        <TextInfo :title="$t('trade.details')" lg />
      </p>
      <div class="mt-4">
        <TextInfo class="mt-2" :title="$t('trade.min_received_amount')">
          <span
            v-if="minimumReceivedAmount.gt(0)"
            data-cy="trading-page-details-minimum-amount-text-content"
            class="flex items-start break-all"
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
            class="flex items-center"
            data-cy="trading-page-details-taker-fee-percentage-text-content"
          >
            {{ `${takerFeeRateToFormat}%` }}
          </span>
        </TextInfo>
      </div>
    </Drawer>
  </div>
</template>

<script lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import Vue, { PropType } from 'vue'
import Drawer from '~/components/elements/drawer.vue'

export default Vue.extend({
  components: {
    Drawer
  },

  props: {
    detailsDrawerOpen: {
      required: true,
      type: Boolean
    },

    minimumReceivedAmount: {
      type: Object as PropType<BigNumberInBase>,
      default: undefined
    },

    orderTypeBuy: {
      required: true,
      type: Boolean
    },

    takerFeeRateToFormat: {
      type: String,
      default: undefined
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
    }
  },

  methods: {
    onDrawerToggle() {
      this.$emit('set:drawer-toggle')
    }
  }
})
</script>
