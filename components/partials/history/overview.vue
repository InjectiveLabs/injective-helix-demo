<template>
  <v-card>
    <div>
      <div v-if="false" class="grid grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
        <v-item class="col-span-2 lg:col-span-3">
          <template slot="value"> - </template>
          <template slot="title"> Margin </template>
        </v-item>
        <v-item class="col-span-2 lg:col-span-3">
          <template slot="value"> - </template>
          <template slot="title"> Colateral </template>
        </v-item>
        <v-item class="col-span-2 lg:col-span-3">
          <template slot="value"> - </template>
          <template slot="title"> Colateral </template>
        </v-item>
        <v-item class="col-span-2 lg:col-span-3">
          <template slot="value"> - </template>
          <template slot="title"> Colateral </template>
        </v-item>
      </div>
      <v-user-wallet-connect-warning cta />
    </div>
  </v-card>
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
