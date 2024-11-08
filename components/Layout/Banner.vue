<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { NuxtUiIcons } from '@shared/types'
import { getBridgeRedirectionUrl } from '@/app/utils/network'
import { PortfolioStatusKey } from '@/types'

const isBannerVisible = ref(true)
const sharedWalletStore = useSharedWalletStore()
const accountStore = useAccountStore()

function hideBanner() {
  isBannerVisible.value = false
}

const hasBalance = computed(() => {
  if (!sharedWalletStore.isUserConnected) {
    return true
  }

  if (portfolioStatus.isLoading()) {
    return true
  }

  return (
    portfolioStatus.isIdle() && Object.keys(accountStore.balancesMap).length > 0
  )
})

const portfolioStatus = inject(
  PortfolioStatusKey,
  new Status(StatusType.Loading)
)
</script>

<template>
  <div
    v-if="isBannerVisible && !hasBalance"
    class="bg-blue-400 text-blue-900 flex items-center px-3 py-1.5 text-sm justify-between relative z-40"
  >
    <div />

    <NuxtLink
      :to="getBridgeRedirectionUrl()"
      target="_blank"
      class="hover:text-white"
    >
      <div class="flex items-center space-x-2">
        <p>{{ $t('globalBanner.title') }}</p>

        <UIcon
          :name="NuxtUiIcons.ArrowLeft"
          class="h-4 w-4 min-w-4 rotate rotate-180"
        />
      </div>
    </NuxtLink>

    <UIcon
      :name="NuxtUiIcons.Close"
      class="h-4 w-4 min-w-4 hover:text-white"
      @click="hideBanner"
    />
  </div>
</template>
