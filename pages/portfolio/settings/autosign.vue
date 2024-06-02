<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { PortfolioSubPage } from '@/types'

const walletStore = useWalletStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

function connectAutoSign() {
  status.setLoading()

  walletStore
    .connectAutoSign()
    .catch($onError)
    .finally(() => status.setIdle())
}

function disconnectAutoSign() {
  status.setLoading()

  walletStore
    .disconnectAutoSign()
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <div>
    <div class="flex items-center p-4">
      <NuxtLink :to="{ name: PortfolioSubPage.Settings }" class="pr-4">
        <SharedIcon name="chevron" />
      </NuxtLink>

      <h3 class="portfolio-title">
        {{ $t('portfolio.settings.autoSign.title') }}
      </h3>
    </div>

    <div class="border-y divide-y">
      <div class="flex flex-col items-center p-4">
        <p class="max-w-3xl text-sm mb-8">
          {{ $t('portfolio.settings.autoSign.howItWorks') }}
        </p>

        <AppButton v-if="walletStore.isAuthzWalletConnected" :disabled="true">
          {{ $t('common.notAvailableinAuthZMode') }}
        </AppButton>

        <AppButton
          v-else-if="!walletStore.isAutoSignEnabled"
          variant="success"
          :status="status"
          @click="connectAutoSign"
        >
          {{ $t('portfolio.settings.autoSign.enable') }}
        </AppButton>
        <AppButton
          v-else
          variant="danger"
          :status="status"
          @click="disconnectAutoSign"
        >
          {{ $t('portfolio.settings.autoSign.disconnect') }}
        </AppButton>
      </div>
    </div>
  </div>
</template>
