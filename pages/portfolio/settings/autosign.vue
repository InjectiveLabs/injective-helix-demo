<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const walletStore = useWalletStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

function connectAutoSign() {
  status.setLoading()

  walletStore
    .connectAutoSign()
    .then(() => {
      //
    })
    .catch($onError)
    .finally(() => status.setIdle())
}

function disconnectAutoSign() {
  status.setLoading()

  walletStore
    .disconnectAutoSign()
    .then(() => {
      //
    })
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <div>
    <div class="flex items-center p-4">
      <NuxtLink :to="{ name: 'portfolio-settings' }" class="pr-4">
        <SharedIcon name="chevron" />
      </NuxtLink>

      <h3 class="portfolio-title">
        {{ $t('portfolio.settings.autoSign.title') }}
      </h3>
    </div>

    <div class="border-y divide-y">
      <div class="flex flex-col items-center p-4">
        <p class="max-w-lg font-semibold text-sm mb-8">
          Auto-Sign works by generating a private key and granting it AuthZ
          (Authorization) which we store in local storage so we can auto-sign
          the transaction without exposing your private key
        </p>
        <AppButton
          v-if="!walletStore.autoSign"
          variant="success"
          :status="status"
          @click="connectAutoSign"
        >
          Enable Auto-Sign
        </AppButton>
        <AppButton
          v-else
          variant="danger"
          :status="status"
          @click="disconnectAutoSign"
        >
          Disconnect Auto-Sign
        </AppButton>
      </div>
    </div>
  </div>
</template>
