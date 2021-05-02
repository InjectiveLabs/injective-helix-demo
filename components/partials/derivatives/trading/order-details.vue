<template>
  <div v-if="market" class="mt-4 py-4 border-t relative">
    <v-drawer
      :custom-handler="true"
      :custom-is-open="detailsDrawerOpen"
      @drawer-toggle="onDrawerToggle"
    >
      <p slot="header" class="flex justify-between text-sm">
        <v-ui-text muted-md>{{ $t('total') }}</v-ui-text>
        <v-ui-text class="flex items-center text-gray-500">
          <span class="mr-1">≈</span>
          <v-ui-format-price
            v-bind="{
              value: total
            }"
          />
          <small class="opacity-75 ml-1 pt-px">{{
            market.quoteToken.symbol
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
            <small class="opacity-75 ml-1">{{ market.baseTokenSymbol }}</small>
          </v-ui-text>
          <v-ui-text v-else muted-sm class="group-hover:text-white">
            &mdash;
          </v-ui-text>
        </p>
        <p class="flex justify-between group leading-6">
          <v-ui-text muted-sm class="group-hover:text-white">
            {{ $t('price') }}
          </v-ui-text>
          <v-ui-text v-if="price.gt(0)" muted class="flex items-center">
            <v-ui-format-price
              v-bind="{
                value: price
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
          <v-ui-text muted-sm class="group-hover:text-white">
            {{ $t('liquidation_price') }}
          </v-ui-text>
          <v-ui-text
            v-if="liquidationPrice.gt(0)"
            muted
            class="flex items-center"
          >
            <v-ui-format-price
              v-bind="{
                value: liquidationPrice
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
          <v-ui-text muted-sm class="group-hover:text-white">
            {{ $t('margin') }}
          </v-ui-text>
          <v-ui-text v-if="margin.gt(0)" muted class="flex items-center">
            <v-ui-format-price
              v-bind="{
                value: margin
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
          <v-ui-text muted-sm class="group-hover:text-white">{{
            $t('notional_value')
          }}</v-ui-text>
          <v-ui-text v-if="notionalValue.gt(0)" muted class="flex items-center">
            <v-ui-format-price
              v-bind="{
                value: notionalValue
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
          <v-ui-text muted-sm class="group-hover:text-white">{{
            $t('fee')
          }}</v-ui-text>
          <v-ui-text v-if="fees.gt(0)" muted class="flex items-center">
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
      </div>
    </v-drawer>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import Drawer from '~/components/elements/drawer.vue'
import { DerivativeOrderType, UiDerivativeMarket } from '~/types'

export default Vue.extend({
  components: {
    'v-drawer': Drawer
  },

  props: {
    orderType: {
      required: true,
      type: String as PropType<DerivativeOrderType>
    },

    total: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    liquidationPrice: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    margin: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    fees: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    notionalValue: {
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

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    }
  },

  methods: {
    onDrawerToggle() {
      this.$emit('drawer-toggle')
    }
  }
})
</script>
