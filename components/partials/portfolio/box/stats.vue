<template>
  <div class="grid grid-cols-2 sm:grid-cols-6 lg:grid-cols-12 gap-4 lg:gap-6">
    <v-item class="col-span-2 sm:col-span-3">
      <template slot="value">
        <span v-if="isUserWalletConnected" class="font-mono text-lg">
          {{ availableBalanceInUsdToString }}
          <span class="text-xs text-gray-400">USD</span>
        </span>
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
        <span v-if="isUserWalletConnected" class="font-mono text-lg">
          {{ lockedBalanceInUsdToString }}
          <span class="text-xs text-gray-400">USD</span>
        </span>
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
        <span v-if="isUserWalletConnected" class="font-mono text-lg">
          {{ unrealizedPnLInUsdToString }}
          <span class="text-xs text-gray-400">USD</span>
        </span>
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
        <span v-if="isUserWalletConnected" class="font-mono text-lg">
          {{ bankBalancesTotalInUsdToString }}
          <span class="text-xs text-gray-400">USD</span>
        </span>
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

    bankBalancesTotalInUsdToString: {
      required: true,
      type: String
    },

    unrealizedPnLInUsd: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    unrealizedPnLInUsdToString: {
      required: true,
      type: String
    },

    availableBalanceInUsd: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    availableBalanceInUsdToString: {
      required: true,
      type: String
    },

    lockedBalanceInUsd: {
      required: true,
      type: Object as PropType<BigNumberInBase>
    },

    lockedBalanceInUsdToString: {
      required: true,
      type: String
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  }
})
</script>
