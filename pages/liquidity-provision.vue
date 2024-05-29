<script setup lang="ts">
import {
  Status,
  BigNumber,
  StatusType,
  BigNumberInBase
} from '@injectivelabs/utils'
import { spotGridMarkets } from '@/app/data/grid-strategy'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  LiquidityProvisionType,
  LiquidityProvisionMitoCard,
  LiquidityProvisionTypeOption
} from '@/types'
import { MITO_VAULTS, SGT_MARKETS } from '@/app/data/liquidityProvision'

const liquidityProvisionStore = useLiquidityProvisionStore()
const { $onError } = useNuxtApp()

const type = ref(LiquidityProvisionTypeOption.All)
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

const vaults = computed(() => {
  if (
    ![
      LiquidityProvisionTypeOption.All,
      LiquidityProvisionTypeOption.Mito
    ].includes(type.value)
  ) {
    return []
  }

  const MAX_APY_DISPLAY = '1M+'
  const MAX_APY_TO_SHOW = 1_000_000

  return liquidityProvisionStore.vaults
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
    .filter((vault) => MITO_VAULTS.includes(vault.contractAddress))
    .sort((vault1, vault2) => {
      if (vault2.apy === vault1.apy) {
        return vault2.tvl - vault1.tvl
      }

      return new BigNumberInBase(vault2.apy).minus(vault1.apy).toNumber()
    })
})

const spotGridTradingBots = computed(() => {
  if (
    ![
      LiquidityProvisionTypeOption.All,
      LiquidityProvisionTypeOption.Helix
    ].includes(type.value)
  ) {
    return []
  }

  return spotGridMarkets.filter((bot) => SGT_MARKETS.includes(bot.slug))
})
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

      <div class="max-w-full">
        <div
          class="border-b border-brand-700 my-4 flex justify-between items-end flex-wrap"
        >
          <div class="flex overflow-x-auto">
            <AppButtonSelect
              v-for="value in Object.values(LiquidityProvisionTypeOption)"
              :key="value"
              v-model="type"
              v-bind="{ value }"
              class="capitalize text-gray-200 px-4 py-2 text-sm border-b font-medium whitespace-nowrap"
              active-classes="border-blue-500 !text-blue-500"
            >
              {{ value }}
            </AppButtonSelect>
          </div>
        </div>
      </div>

      <div
        class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-4"
      >
        <PartialsLiquidityProvisionItemInjStaking
          v-if="type === LiquidityProvisionTypeOption.All"
        />

        <PartialsLiquidityProvisionItemSpotGridBot
          v-for="gridMarket in spotGridTradingBots"
          :key="gridMarket.slug"
          v-bind="{ gridMarket }"
        />

        <PartialsLiquidityProvisionItemMitoVault
          v-for="vault in vaults"
          :key="`${vault.marketId}-${vault.type}`"
          v-bind="{
            vault
          }"
        />
      </div>
    </AppHocLoading>
  </div>
</template>
