<script setup lang="ts">
import { BigNumber, Status, StatusType } from '@injectivelabs/utils'
import { BulletinMitoCard } from '@/types'
import { spotGridMarkets } from '~/app/data/grid-strategy'

const mitoStore = useMitoStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  status.setLoading()

  Promise.all([mitoStore.fetchVaults(), mitoStore.fetchStakingPools()])
    .catch($onError)
    .finally(() => status.setIdle())
})

const vaults = computed(() =>
  mitoStore.vaults
    .map((vault) => {
      const stakingPool = mitoStore.stakingPools.find(
        (pool) => pool.vaultAddress === vault.contractAddress
      )

      return {
        apy: BigNumber.max(vault.apy, 0)
          .plus(stakingPool?.apr || 0)
          .toNumber(),
        tvl: vault.currentTvl,
        marketId: vault.marketId,
        vaultType: vault.vaultType,
        platform: 'Mito',
        type: 'LP Vaults',
        contractAddress: vault.contractAddress
      } as BulletinMitoCard
    })
    .sort((a, b) => b.apy - a.apy)
    .slice(0, 5)
)
</script>

<template>
  <div class="container py-10">
    <h2 class="text-2xl font-semibold">{{ $t('bulletin.title') }}</h2>
    <p class="text-gray-300 mt-2">{{ $t('bulletin.description') }}</p>

    <AppHocLoading v-bind="{ status }">
      <div
        class="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4"
      >
        <PartialsBulletinItemInjStaking />

        <PartialsBulletinItemMitoVault
          v-for="vault in vaults"
          :key="`${vault.marketId}-${vault.platform}-${vault.type}`"
          v-bind="{
            vault
          }"
        />

        <PartialsBulletinItemSpotGridBot
          v-for="gridMarket in spotGridMarkets.slice(0, 3)"
          :key="gridMarket.slug"
          v-bind="{ gridMarket }"
        />
      </div>
    </AppHocLoading>
  </div>
</template>
