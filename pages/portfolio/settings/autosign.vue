<script setup lang="ts">
const walletStore = useWalletStore()
</script>

<template>
  <div>
    <div class="flex items-center p-4">
      <NuxtLink :to="{ name: 'portfolio-settings' }" class="pr-4">
        <BaseIcon name="chevron" />
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
          @click="walletStore.connectAutoSign"
        >
          Enable Auto-Sign
        </AppButton>
        <AppButton
          v-else
          variant="danger"
          @click="walletStore.disconnectAutoSign"
        >
          Disconnect Auto-Sign
        </AppButton>
      </div>
    </div>
  </div>
</template>
