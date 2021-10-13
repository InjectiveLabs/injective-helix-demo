<template>
  <div class="grid grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
    <v-item class="col-span-2 lg:col-span-4">
      <template slot="value">
        <span v-if="isUserWalletConnected" class="font-mono text-lg">{{
          4
        }}</span>
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
    <v-item class="col-span-2 lg:col-span-4">
      <template slot="value">
        <span v-if="isUserWalletConnected" class="font-mono text-lg">{{
          5
        }}</span>
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
    <v-item class="col-span-2 lg:col-span-4">
      <template slot="value">
        <span v-if="isUserWalletConnected" class="font-mono text-lg">{{
          6
        }}</span>
        <span v-else>&mdash;</span>
      </template>
      <template slot="title">
        <div class="flex items-center justify-center">
          {{ $t('total_potential') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('total_potential_tooltip')"
          />
        </div>
      </template>
    </v-item>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VItem from '~/components/partials/common/stats/item.vue'

export default Vue.extend({
  components: {
    VItem
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  }
})
</script>
