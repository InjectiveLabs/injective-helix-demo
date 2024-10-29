<script setup lang="ts">
const tokenStore = useTokenStore()

const markets = computed(() =>
  tokenStore.tradeableTokens
    .map((token) => [token.symbol, tokenStore.tokenUsdPrice(token)])
    .filter(([_, price]) => Number(price) > 0.001)
    .sort(() => Math.random() - 0.5)
)
</script>

<template>
  <div class="md:fixed bottom-0 w-full">
    <div class="flex items-center bg-brand-900 border-t px-4 py-1 text-xs z-30">
      <div class="w-2 h-2 rounded-full bg-green-500 mr-2" />
      <div class="divide-x-2 border-white flex">
        <div class="px-2">
          {{ $t('banners.footer.operational') }}
        </div>
        <div
          class="px-2 bg-gradient-to-r from-blue-500 to-blue-200 bg-clip-text text-transparent"
        >
          {{ $t('banners.footer.v2') }}
        </div>
      </div>

      <AppMarquee class="flex-1">
        <div class="text-[10px] font-mono text-white space-x-2 flex">
          <template v-for="([symbol, price], i) in markets" :key="symbol">
            <span v-if="i !== 0" class="text-coolGray-600">|</span>

            <span>
              <span class="text-coolGray-400">{{ symbol }}: </span>
              <span class="text-green-500">
                $ {{ Number(price).toFixed(3) }}
              </span>
            </span>
          </template>
        </div>
      </AppMarquee>
    </div>
  </div>
</template>
