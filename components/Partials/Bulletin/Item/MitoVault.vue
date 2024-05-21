<script setup lang="ts">
import { getMitoUrl } from '@shared/utils/network'
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

const mitoUrl = `${getMitoUrl()}/vault/${props.vault.contractAddress}/`

const { valueToString: tvlToString } = useSharedBigNumberFormatter(
  computed(() => props.vault.tvl)
)
</script>

<template>
  <PartialsBulletinItem
    v-if="market"
    v-bind="{
      url: mitoUrl,
      title: market.ticker,
      description: $t(`bulletin.type.${props.vault.type}`)
    }"
  >
    <template #default>
      <CommonTokenIcon is-lg v-bind="{ token: market?.baseToken }" />
      <div
        class="absolute border left-5 top-4 bg-white rounded-full grid place-items-center"
      >
        <AssetMitoLogo class="!w-5 !h-5" />
      </div>
    </template>

    <template #content>
      <div class="min-w-0 truncate">
        <p>{{ $t('bulletin.TVL') }}</p>
        <p class="text-xl font-semibold truncate">${{ tvlToString }}</p>
      </div>

      <div class="min-w-0 truncate">
        <p>{{ $t('bulletin.APY') }}</p>
        <p class="text-green-500 text-xl font-semibold truncate">
          {{ vault.apyToShow }}%
        </p>
      </div>
    </template>
  </PartialsBulletinItem>
</template>
