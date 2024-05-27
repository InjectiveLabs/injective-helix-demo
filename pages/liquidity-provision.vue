<script setup lang="ts">
import {
  Status,
  BigNumber,
  StatusType,
  BigNumberInBase
} from '@injectivelabs/utils'
import { spotGridMarkets } from '@/app/data/grid-strategy'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { BulletinType, BulletinMitoCard } from '@/types'

const MAX_APY_DISPLAY = '1M+'
const MAX_APY_TO_SHOW = 1_000_000

const bulletinStore = useBulletinStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  status.setLoading()

  Promise.all([
    bulletinStore.fetchAprParams(),
    bulletinStore.fetchMitoVaults(),
    bulletinStore.fetchMitoStakingPools()
  ])
    .catch($onError)
    .finally(() => status.setIdle())
})

const vaults = computed(() =>
  bulletinStore.vaults
    .map((vault) => {
      const stakingPool = bulletinStore.stakingPools.find(
        (pool) => pool.vaultAddress === vault.contractAddress
      )

      const apy = BigNumber.max(vault.apy, 0)
        .plus(stakingPool?.apr || 0)
        .toNumber()

      const apyToShow = new BigNumberInBase(apy).gte(MAX_APY_TO_SHOW)
        ? MAX_APY_DISPLAY
        : apy.toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS)

      return {
        apy,
        apyToShow,
        tvl: vault.currentTvl,
        marketId: vault.marketId,
        vaultType: vault.vaultType,
        type: BulletinType.MitoVault,
        contractAddress: vault.contractAddress
      } as BulletinMitoCard
    })
    .sort((vault1, vault2) => {
      if (vault2.apy === vault1.apy) {
        return vault2.tvl - vault1.tvl
      }

      return new BigNumberInBase(vault2.apy).minus(vault1.apy).toNumber()
    })
    .slice(0, 5)
)
</script>

<template>
  <div class="container py-10">
    <h2 class="text-2xl font-semibold">{{ $t('bulletin.title') }}</h2>
    <p class="text-gray-300 mt-2">{{ $t('bulletin.description') }}</p>

    <AppHocLoading v-bind="{ status }">
      <div
        class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4"
      >
        <PartialsBulletinItemInjStaking />

        <PartialsBulletinItemMitoVault
          v-for="vault in vaults"
          :key="`${vault.marketId}-${vault.type}`"
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
