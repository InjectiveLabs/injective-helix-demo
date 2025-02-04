<script setup lang="ts">
import { getMitoUrl } from '@shared/utils/network'
import { LiquidityProvisionMitoCard, VaultsCyTags } from '@/types'

const props = withDefaults(
  defineProps<{
    vault: LiquidityProvisionMitoCard
  }>(),
  {}
)

const emit = defineEmits<{
  'update:selectedVaultUrl': [value: string]
}>()

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()

const market = computed(() =>
  [...derivativeStore.markets, ...spotStore.markets].find(
    (market) => market.marketId === props.vault.marketId
  )
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
      description: $t(`liquidityProvision.item.type.${props.vault.type}`)
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
          {{ $t('liquidityProvision.TVL') }}
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
          {{ $t('liquidityProvision.APY') }}
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
