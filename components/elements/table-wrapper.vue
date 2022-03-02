<template>
  <div class="h-full grow relative">
    <div
      class="min-h-orders max-h-lg flex-col inset-0 h-full overflow-y-auto bg-gray-900"
      :class="{
        'md:min-h-0 md:max-h-full md:flex md:absolute': breakMd,
        'lg:min-h-0 lg:max-h-full lg:flex lg:absolute': !breakMd
      }"
    >
      <v-user-wallet-connect-warning
        v-if="!isUserWalletConnected"
        class="bg-gray-900"
      />
      <slot v-else />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    breakMd: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  }
})
</script>
