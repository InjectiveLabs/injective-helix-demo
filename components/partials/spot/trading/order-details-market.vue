<template>
  <div v-if="market" class="mt-4 py-4 border-t relative">
    <v-drawer
      :custom-handler="true"
      :custom-is-open="detailsDrawerOpen"
      @drawer-toggle="onDrawerToggle"
    >
      <p slot="header" class="flex justify-between text-sm">
        <v-ui-text muted-md>
          {{ $t('total') }}
        </v-ui-text>
        <v-ui-text em class="flex text-gray-500 align-bottom">
          <span class="mr-1">≈</span>
          <v-ui-format-price
            v-bind="{
              value: extractedTotal
            }"
          />
          <small class="opacity-75 pt-px ml-1">{{
            orderTypeBuy ? market.quoteToken.symbol : market.baseToken.symbol
          }}</small>
        </v-ui-text>
      </p>
      <div class="text-xs mt-2">
        <p class="flex justify-between group leading-6">
          <v-ui-text muted-sm class="group-hover:text-white">
            {{ $t('amount') }}
          </v-ui-text>
          <v-ui-text v-if="!amount.isNaN()" muted class="flex items-center">
            <v-ui-format-amount
              v-bind="{
                value: amount
              }"
              class="text-gray-300"
            />
            <small class="opacity-75 ml-1">{{ market.baseToken.symbol }}</small>
          </v-ui-text>
          <v-ui-text v-else muted-sm class="group-hover:text-white">
            &mdash;
          </v-ui-text>
        </p>
        <!--
        <p class="flex justify-between group leading-6">
          <v-ui-text muted-sm class="group-hover:text-white">
            {{ $t('notional_value') }}
          </v-ui-text>
          <v-ui-text v-if="total.gt(0)" muted class="flex items-center">
            <span class="mr-1">≈</span>
            <v-ui-format-price
              v-bind="{
                value: total
              }"
              class="text-gray-300"
            />
            <small class="opacity-75 ml-1">{{
              market.quoteToken.symbol
            }}</small>
          </v-ui-text>
          <v-ui-text v-else muted-sm class="group-hover:text-white">
            &mdash;
          </v-ui-text>
        </p>
        -->
        <p v-if="!orderTypeBuy" class="flex justify-between group leading-6">
          <v-ui-text
            muted-sm
            class="group-hover:text-white flex items-center max-w-4xs sm:max-w-lg"
            ><span class="mr-2">{{ $t('est_receiving_amount') }}</span
            ><v-ui-icon
              :icon="Icon.Info"
              class="text-gray-500 hover:text-gray-300"
              :tooltip="$t('est_receiving_amount_note')"
              2xs
          /></v-ui-text>
          <v-ui-text v-if="total.gt(0)" muted class="flex items-center">
            <v-ui-format-price
              v-bind="{
                value: totalWithoutFees
              }"
              class="text-gray-300"
            />
            <small class="opacity-75 ml-1">{{
              market.quoteToken.symbol
            }}</small>
          </v-ui-text>
          <v-ui-text v-else muted-sm class="group-hover:text-white">
            &mdash;
          </v-ui-text>
        </p>
        <p class="flex justify-between group leading-6">
          <v-ui-text muted-sm class="group-hover:text-white flex items-center"
            ><span>{{ $t('fee') }}</span></v-ui-text
          >
          <v-ui-text v-if="fees.gt(0)" muted class="flex items-center">
            <span class="mr-1">≈</span>
            <v-ui-format-price
              v-bind="{
                value: fees
              }"
              class="text-gray-300"
            />
            <small class="opacity-75 ml-1">{{
              market.quoteToken.symbol
            }}</small>
          </v-ui-text>
          <v-ui-text v-else muted-sm class="group-hover:text-white">
            &mdash;
          </v-ui-text>
        </p>
        <p class="mt-2">
          <v-ui-text xs muted class="flex items-center">
            {{ $t('worst_price_note', { slippage: slippage.toFixed() }) }}
          </v-ui-text>
        </p>
      </div>
    </v-drawer>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import Drawer from '~/components/elements/drawer.vue'
import { SpotOrderSide, Icon, UiSpotMarket } from '~/types'
import { DEFAULT_MAX_SLIPPAGE, ZERO_IN_BASE } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    'v-drawer': Drawer
  },

  props: {
    orderTypeBuy: {
      required: true,
      type: Boolean
    },

    orderType: {
      required: true,
      type: String as PropType<SpotOrderSide>
    },

    total: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    totalWithFees: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    totalWithoutFees: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    feeReturned: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    fees: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    price: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    amount: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    detailsDrawerOpen: {
      required: true,
      type: Boolean
    }
  },

  data() {
    return {
      Icon
    }
  },

  computed: {
    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    slippage(): BigNumberInBase {
      return new BigNumberInBase(DEFAULT_MAX_SLIPPAGE)
    },

    extractedTotal(): BigNumberInBase {
      const { totalWithFees, amount, orderTypeBuy } = this

      if (orderTypeBuy) {
        return totalWithFees
      }

      if (amount.isNaN()) {
        return ZERO_IN_BASE
      }

      return amount
    }
  },

  methods: {
    onDrawerToggle() {
      this.$emit('drawer-toggle')
    }
  }
})
</script>
