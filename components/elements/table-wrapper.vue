<template>
  <div class="h-full flex-grow relative">
    <div
      class="min-h-orders max-h-md flex-col inset-0 h-full overflow-y-auto bg-gray-900"
      :class="{
        'md:min-h-0 md:max-h-full md:flex md:absolute md:pb-4': breakMd,
        'break-lg': !breakMd
      }"
    >
      <UserWalletConnectWarning
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
      default: false
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  }
})
</script>

<style lang="scss" scoped>
.break-lg {
  @media (min-width: 1024px) and (min-height: 1024px) {
    @apply min-h-0 max-h-full flex absolute pb-4;
  }
}
</style>
