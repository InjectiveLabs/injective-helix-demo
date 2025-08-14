<script setup lang="ts">
import { TradeSubPage } from '@/types'
import type { TokenStatic } from '@injectivelabs/sdk-ts'

const route = useRoute()
const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const sharedTokenStore = useSharedTokenStore()
const sharedWalletStore = useSharedWalletStore()

const markets = ref<[string, number][]>([])

const isLoaded = computed(
  () => Object.keys(sharedTokenStore.tokenUsdPriceMap).length > 0
)

const tradableTokens = computed(() => {
  const denoms = [
    ...new Set([...derivativeStore.tradableDenoms, ...spotStore.tradableDenoms])
  ]

  return denoms
    .map((denom) => sharedTokenStore.tokenByDenomOrSymbol(denom))
    .filter((token) => token) as TokenStatic[]
})

onMounted(async () => {
  await until(isLoaded).toBe(true)

  markets.value = tradableTokens.value
    .map<[string, number]>((token) => [
      token.symbol,
      sharedTokenStore.tokenUsdPrice(token)
    ])
    .filter(([_, price]) => Number(price) > 0.001)
    .sort(() => Math.random() - 0.5)
})
</script>

<template>
  <div class="md:fixed bottom-0 w-full z-[11]">
    <div
      class="flex items-center bg-brand-900 px-4 py-1 text-xs z-30"
      :class="[
        [TradeSubPage.Futures, TradeSubPage.Spot].includes(
          route.name as TradeSubPage
        )
          ? 'border-t-2'
          : 'border-t'
      ]"
    >
      <div
        class="w-2 h-2 rounded-full mr-2"
        :class="[sharedWalletStore.isEip712 ? 'bg-orange-500' : 'bg-green-500']"
      />
      <div class="divide-x-2 border-white flex">
        <div class="px-2">
          {{ $t('footer.operational') }}
        </div>
        <div
          class="px-2 bg-gradient-to-r from-blue-500 to-blue-200 bg-clip-text text-transparent"
        >
          {{ $t('footer.v2') }}
        </div>
      </div>

      <AppMarquee class="flex-1">
        <div class="text-[10px] text-white space-x-2 flex">
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
