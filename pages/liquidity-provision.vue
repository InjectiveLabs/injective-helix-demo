<script setup lang="ts">
import {
  Status,
  BigNumber,
  StatusType,
  BigNumberInBase
} from '@injectivelabs/utils'
import { spotGridMarkets } from '@/app/data/grid-strategy'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { LiquidityProvisionType, LiquidityProvisionMitoCard } from '@/types'
import { mainnetWhitelistedVaults } from '@/app/data/liquidityProvision'

const MAX_APY_DISPLAY = '1M+'
const MAX_APY_TO_SHOW = 1_000_000

const liquidityProvisionStore = useLiquidityProvisionStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

onMounted(() => {
  status.setLoading()

  Promise.all([
    liquidityProvisionStore.fetchAprParams(),
    liquidityProvisionStore.fetchMitoVaults(),
    liquidityProvisionStore.fetchMitoStakingPools()
  ])
    .catch($onError)
    .finally(() => status.setIdle())
})

const vaults = computed(() =>
  liquidityProvisionStore.vaults
    .map((vault) => {
      const stakingPool = liquidityProvisionStore.stakingPools.find(
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
        type: LiquidityProvisionType.MitoVault,
        contractAddress: vault.contractAddress
      } as LiquidityProvisionMitoCard
    })
    .filter((vault) => mainnetWhitelistedVaults.includes(vault.contractAddress))
    .sort((vault1, vault2) => {
      if (vault2.apy === vault1.apy) {
        return vault2.tvl - vault1.tvl
      }

      return new BigNumberInBase(vault2.apy).minus(vault1.apy).toNumber()
    })
)
</script>

<template>
  <div class="container py-10">
    <AppHocLoading v-bind="{ status }">
      <h2 class="text-2xl font-semibold">
        {{ $t('liquidityProvision.title') }}
      </h2>
      <p class="text-gray-300 mt-2">
        {{ $t('liquidityProvision.description') }}
      </p>

      <div
        class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4"
      >
        <PartialsLiquidityProvisionItemInjStaking />

        <PartialsLiquidityProvisionItemMitoVault
          v-for="vault in vaults"
          :key="`${vault.marketId}-${vault.type}`"
          v-bind="{
            vault
          }"
        />

        <PartialsLiquidityProvisionItemSpotGridBot
          v-for="gridMarket in spotGridMarkets.slice(0, 3)"
          :key="gridMarket.slug"
          v-bind="{ gridMarket }"
        />
      </div>
    </AppHocLoading>
  </div>
</template>
