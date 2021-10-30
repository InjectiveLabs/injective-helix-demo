<template>
  <div>
    <div class="p-2 w-full text-center lg:text-left">
      <p class="text-xs uppercase text-gray-400">
        <span class="flex w-full justify-center lg:justify-start">
          {{ $t('reward_earned_up_to_date') }}
          <v-icon-info-tooltip
            class="ml-2"
            :tooltip="$t('reward_earned_up_to_date_tooltip')"
          />
        </span>
      </p>
      <h2 class="mt-2 text-lg lg:text-xl 2xl:text-2xl font-mono text-gray-100">
        &#8776; - INJ
      </h2>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    //
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  }
})
</script>
