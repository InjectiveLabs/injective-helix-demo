<script lang="ts" setup>
const walletStore = useSharedWalletStore()

const url = computed(() => {
  const suffix = walletStore.isUserConnected
    ? `&onToAddress=${walletStore.injectiveAddress}`
    : ''

  return `https://app.kado.money/ramp?product=BUY&onPayCurrency=USD&onRevCurrency=USDT&offPayCurrency=USDC&offRevCurrency=USD&network=INJECTIVE${suffix}`
})
</script>

<template>
  <div
    class="p-4 w-full bg-brand-900 border-b border-brand-800 flex sm:items-center justify-center gap-2"
  >
    <span class="text-sm md:text-lg">
      {{ $t('banners.kado.title') }}
    </span>

    <NuxtLink :to="url" target="_blank">
      <div class="flex items-center justify-start gap-1">
        <span
          class="text-sm md:text-lg text-blue-500 font-medium whitespace-nowrap"
        >
          {{ $t('banners.kado.tryNow') }}
        </span>

        <SharedIcon name="arrow" class="rotate-135 w-3 h-3 text-blue-500" />
      </div>
    </NuxtLink>
  </div>
</template>
