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
          <span
            class="flex items-center"
            data-cy="trading-page-details-fee-percentage-text-content"
          >
            {{
              postOnly
                ? `${makerFeeRateToFormat}%`
                : `${makerFeeRateToFormat}%/${takerFeeRateToFormat}%`
            }}
          </span>
        </TextInfo>
      </div>
    </Drawer>
  </div>
</template>

<script lang="ts">
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import Vue from 'vue'
import Drawer from '~/components/elements/drawer.vue'

export default Vue.extend({
  components: {
    Drawer
  },

  props: {
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

    detailsDrawerOpen: {
      type: Boolean,
      required: true
    }
  },

  computed: {
    market(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    }
  },

  methods: {
    onDrawerToggle() {
      this.$emit('set:drawer-toggle')
    }
  }
})
</script>
