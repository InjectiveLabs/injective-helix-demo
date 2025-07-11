<script setup lang="ts">
import { getMitoUrl } from '@shared/utils/network'
import { VaultsCyTags } from '@/types'
import type { LiquidityProvisionMitoCard } from '@/types'

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()

const props = withDefaults(
  defineProps<{
    vault: LiquidityProvisionMitoCard
  }>(),
  {}
)

const emit = defineEmits<{
  'update:selectedVaultUrl': [value: string]
}>()

const market = computed(
  () =>
    spotStore.marketByIdOrSlug(props.vault.marketId) ||
    derivativeStore.marketByIdOrSlug(props.vault.marketId)
)

const mitoUrl = computed(
  () => `${getMitoUrl()}/vault/${props.vault.contractAddress}/`
)

const { valueToString: tvlToString } = useSharedBigNumberFormatter(
  computed(() => props.vault.tvl),
  { decimalPlaces: 0 }
)

function onSelectVault() {
  emit('update:selectedVaultUrl', mitoUrl.value)
}
</script>

<template>
  <PartialsLiquidityProvisionItem
    v-if="market"
    v-bind="{
      title: market.ticker,
      description: $t(`vault.item.${props.vault.type}`)
    }"
    @click="onSelectVault"
  >
    <template #default>
      <CommonTokenIcon is-lg v-bind="{ token: market?.baseToken }" />
    </template>

    <template #source>
      <AssetMitoLogo class="left-1 relative" />
    </template>

    <template #content>
      <div class="min-w-0 truncate">
        <p class="text-coolGray-300 text-sm">
          {{ $t('vault.TVL') }}
        </p>
        <p
          class="text-xl font-semibold truncate"
          :data-cy="dataCyTag(VaultsCyTags.tvl)"
        >
          ${{ tvlToString }}
        </p>
      </div>

      <div class="min-w-0 truncate">
        <p class="text-coolGray-300 text-sm">
          {{ $t('vault.APY') }}
        </p>
        <p
          class="text-green-500 text-xl font-semibold truncate"
          :data-cy="dataCyTag(VaultsCyTags.apy)"
        >
          {{ vault.apyToShow }}%
        </p>
      </div>
    </template>
  </PartialsLiquidityProvisionItem>
</template>
