<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { getBridgeRedirectionUrl } from '@/app/utils/network'
import { PortfolioStatusKey } from '@/types'

const isBannerVisible = ref(true)
const walletStore = useWalletStore()
const accountStore = useAccountStore()

function hideBanner() {
  isBannerVisible.value = false
}

const hasBalance = computed(() => {
  if (!walletStore.isUserWalletConnected) {
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
    class="bg-blue-400 text-blue-900 flex items-center px-3 py-2 text-sm justify-between"
  >
    <div />

    <NuxtLink
      :to="getBridgeRedirectionUrl()"
      target="_blank"
      class="hover:text-white"
    >
      <div class="flex items-center space-x-2">
        <p>{{ $t('globalBanner.title') }}</p>

        <SharedIcon name="arrow" class="rotate rotate-180" is-md />
      </div>
    </NuxtLink>

    <SharedIcon
      name="close"
      class="hover:text-white"
      is-md
      @click="hideBanner"
    />
  </div>
</template>
