<template>
  <div class="grid grid-cols-2 sm:grid-cols-6 lg:grid-cols-12 gap-4 lg:gap-6">
    <v-item class="col-span-2 sm:col-span-3">
      <template slot="value">
        <v-emp-number
          v-if="isUserWalletConnected"
          :number="availableBalanceInUsd"
        >
          <span>USD</span>
        </v-emp-number>
        <span v-else>&mdash;</span>
      </template>
      <template slot="title">
        <div class="flex items-center justify-center">
          {{ $t('available_margin') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('available_margin_tooltip')"
          />
        </div>
      </template>
    </v-item>
    <v-item class="col-span-2 sm:col-span-3">
      <template slot="value">
        <v-emp-number v-if="isUserWalletConnected" :number="lockedBalanceInUsd">
          <span>USD</span>
        </v-emp-number>
        <span v-else>&mdash;</span>
      </template>
      <template slot="title">
        <div class="flex items-center justify-center">
          {{ $t('margin_hold') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('margin_hold_tooltip')"
          />
        </div>
      </template>
    </v-item>
    <v-item class="col-span-2 sm:col-span-3">
      <template slot="value">
        <v-emp-number v-if="isUserWalletConnected" :number="unrealizedPnLInUsd">
          <span>USD</span>
        </v-emp-number>
        <span v-else>&mdash;</span>
      </template>
      <template slot="title">
        <div class="flex items-center justify-center">
          {{ $t('unrealized_pnl_portfolio') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('unrealized_pnl_portfolio_tooltip')"
          />
        </div>
      </template>
    </v-item>
    <v-item class="col-span-2 sm:col-span-3">
      <template slot="value">
        <v-emp-number
          v-if="isUserWalletConnected"
          :number="bankBalancesTotalInUsd"
        >
          <span>USD</span>
        </v-emp-number>
        <span v-else>&mdash;</span>
      </template>
      <template slot="title">
        <div class="flex items-center justify-center">
          {{ $t('assets_value') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('assets_value_tooltip')"
          />
        </div>
      </template>
    </v-item>
  </div>
</template>

<script lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import Vue, { PropType } from 'vue'
import VItem from '~/components/partials/common/stats/item.vue'

export default Vue.extend({
  components: {
    VItem
  },

  props: {
    bankBalancesTotalInUsd: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    unrealizedPnLInUsd: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    availableBalanceInUsd: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    lockedBalanceInUsd: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  }
})
</script>
