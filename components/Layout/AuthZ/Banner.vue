<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'

const sharedWalletStore = useSharedWalletStore()
</script>

<template>
  <div class="bg-blue-400 text-blue-900 flex items-center justify-between p-2">
    <div class="flex items-center space-x-2">
      <UIcon :name="NuxtUiIcons.Eye" class="h-6 w-6 min-w-6" />
      <p class="text-xs">
        {{ $t('connect.connectedAs') }}
        <strong>{{ sharedWalletStore.authZOrInjectiveAddress }}</strong>
      </p>
    </div>

    <div class="px-4">
      <UIcon
        :name="NuxtUiIcons.Exit"
        class="text-blue-900 h-6 w-6 min-w-6"
        @click="sharedWalletStore.resetAuthZ()"
      />
    </div>
  </div>
</template>
