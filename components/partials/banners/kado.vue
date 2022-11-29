<template>
  <div class="h-14 w-full bg-cyan-800 flex items-center justify-center gap-2">
    <span class="text-sm md:text-lg">
      {{ $t('banners.kado.title') }}
    </span>

    <a
      :href="url"
      target="_blank"
      class="flex items-center justify-start gap-1"
    >
      <span class="text-sm md:text-lg text-blue-300 font-medium">
        {{ $t('banners.kado.tryNow') }}
      </span>

      <IconArrowDiagonal class="w-3 h-3 text-blue-300" />
    </a>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    injectiveAddress(): string {
      return this.$accessor.wallet.injectiveAddress
    },

    url(): string {
      const { isUserWalletConnected, injectiveAddress } = this

      const suffix = isUserWalletConnected
        ? `&onToAddress=${injectiveAddress}`
        : ''

      return `https://app.kado.money/ramp?product=BUY&onPayCurrency=USD&onRevCurrency=USDT&offPayCurrency=USDC&offRevCurrency=USD&network=INJECTIVE${suffix}`
    }
  }
})
</script>
