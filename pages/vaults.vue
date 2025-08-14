<script setup lang="ts">
import {
  Status,
  BigNumber,
  StatusType,
  BigNumberInBase
} from '@injectivelabs/utils'
import { MITO_VAULTS } from '@/app/data/liquidityProvision'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  Modal,
  VaultType,
  VaultsCyTags,
  VaultTypeOption,
  MitoRegistrationMode
} from '@/types'
import type { LiquidityProvisionMitoCard } from '@/types'

const modalStore = useSharedModalStore()
const liquidityProvisionStore = useLiquidityProvisionStore()
const { $onError } = useNuxtApp()

const selectedVaultUrl = ref('')
const type = ref(VaultTypeOption.All)
const status = reactive(new Status(StatusType.Loading))

const vaults = computed(() => {
  if (![VaultTypeOption.All, VaultTypeOption.Mito].includes(type.value)) {
    return []
  }

  const MAX_APY_DISPLAY = '1M+'
  const MAX_APY_TO_SHOW = 1_000_000

  return liquidityProvisionStore.vaults
    .map((vault) => {
      const stakingPool = liquidityProvisionStore.stakingPools.find(
        (pool) => pool.vaultAddress === vault.contractAddress
      )

      const apy = BigNumber.max(vault.apy7D, 0)
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
        type: VaultType.MitoVault,
        contractAddress: vault.contractAddress,
        isPermissionless:
          vault.registrationMode === MitoRegistrationMode.Permissionless
      } as LiquidityProvisionMitoCard
    })
    .filter(
      (vault) =>
        (vault.isPermissionless ||
          MITO_VAULTS.includes(vault.contractAddress)) &&
        new BigNumberInBase(vault.apy).gt(0)
    )
    .sort((vault1, vault2) => {
      return new BigNumberInBase(vault2.tvl).minus(vault1.tvl).toNumber()
    })
})

onMounted(() => {
  status.setLoading()

  Promise.all([
    liquidityProvisionStore.fetchMitoVaults(),
    liquidityProvisionStore.fetchMitoStakingPools()
  ])
    .catch($onError)
    .finally(() => status.setIdle())
})

function onSelectVault(vaultUrl: string) {
  selectedVaultUrl.value = vaultUrl
  modalStore.openModal(Modal.MitoRedirect)
}
</script>

<template>
  <AppHocLoading v-bind="{ status }" is-full-screen>
    <div class="container py-10 mx-auto px-4">
      <h2
        class="text-2xl font-semibold"
        :data-cy="dataCyTag(VaultsCyTags.title)"
      >
        {{ $t('vault.title') }}
      </h2>
      <p class="text-coolGray-300 mt-2">
        {{ $t('vault.description') }}
      </p>

      <div
        class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-4"
      >
        <PartialsLiquidityProvisionItemMitoVault
          v-for="vault in vaults"
          :key="`${vault.marketId}-${vault.type}`"
          v-bind="{ vault }"
          @update:selected-vault-url="onSelectVault"
        />
      </div>
      <ModalsMitoRedirect v-bind="{ url: selectedVaultUrl }" />
    </div>
  </AppHocLoading>
</template>
