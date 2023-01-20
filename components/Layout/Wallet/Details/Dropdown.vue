<script lang="ts" setup>
import { formatWalletAddress } from '@injectivelabs/utils'

const walletStore = useWalletStore()

const injectiveAddress = computed(() => {
  return walletStore.injectiveAddress
})

const formattedInjectiveAddress = computed(() => {
  return formatWalletAddress(injectiveAddress.value)
})
</script>

<template>
  <div class="flex items-center">
    <BaseHoverMenu
      popper-class="min-w-[310px] sm:min-w-[356px] bg-gray-850 shadow-dropdown rounded-lg"
    >
      <template #default>
        <div
          class="font-medium text-sm cursor-pointer flex items-center justify-center lg:justify-start w-10 h-10 lg:w-auto lg:px-6 rounded-lg"
        >
          <BaseIcon name="user" class="w-4 h-4 lg:mr-2" />
          <span class="hidden lg:block font-mono">
            {{ formattedInjectiveAddress }}
          </span>
        </div>
      </template>

      <template #content>
        <div class="flex flex-col gap-4 rounded-lg p-4 bg-gray-850">
          <LayoutWalletDetailsConnectedWrapper :wallet="walletStore.wallet" />
        </div>
      </template>
    </BaseHoverMenu>
  </div>
</template>
