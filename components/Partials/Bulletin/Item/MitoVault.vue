<script setup lang="ts">
import { BulletinMitoCard } from '@/types'

const props = defineProps({
  vault: {
    type: Object as PropType<BulletinMitoCard>,
    required: true
  }
})

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()

const market = computed(() =>
  [...derivativeStore.markets, ...spotStore.markets].find(
    (market) => market.marketId === props.vault.marketId
  )
)

const mitoUrl = computed(
  () => `https://mito.fi/vault/${props.vault.contractAddress}/`
)

const { valueToString: apyToString } = useSharedBigNumberFormatter(
  computed(() => props.vault.apy)
)

const { valueToString: tvlToString } = useSharedBigNumberFormatter(
  computed(() => props.vault.tvl)
)
</script>

<template>
  <NuxtLink
    v-if="market"
    target="_blank"
    :to="mitoUrl"
    class="card px-4 py-6 hover:bg-gray-750"
  >
    <div class="flex space-x-4">
      <div class="relative">
        <CommonTokenIcon is-lg v-bind="{ token: market?.baseToken }" />
        <div
          class="absolute border left-5 top-4 bg-white rounded-full grid place-items-center"
        >
          <AssetMitoLogo class="!w-5 !h-5" />
        </div>
      </div>

      <div>
        <p class="text-xl font-semibold">{{ market.ticker }}</p>
        <p class="text-gray-400 text-xs">
          {{ vault.platform }} - {{ vault.type }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-2 mt-8">
      <div class="min-w-0 truncate">
        <p>TVL</p>
        <p class="text-xl font-semibold truncate">${{ tvlToString }}</p>
      </div>
      <div class="min-w-0 truncate">
        <p>APY</p>
        <p class="text-green-500 text-xl font-semibold truncate">
          {{ apyToString }}%
        </p>
      </div>
    </div>
  </NuxtLink>
</template>
