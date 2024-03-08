<script setup lang="ts">
import { SpotOrdersStandardView } from '@/types'

const walletStore = useWalletStore()

const view = ref(SpotOrdersStandardView.OpenOrders)
</script>

<template>
  <div class="h-header border-b flex">
    <CommonSubaccountSelector
      v-if="walletStore.isUserWalletConnected"
      show-low-balance
    >
      <template #default="{ isOpen, activeSubaccountLabel }">
        <button
          v-show="activeSubaccountLabel"
          class="flex items-center space-x-2 px-4 border-r"
        >
          <span
            class="text-sm font-semibold px-4 bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent"
          >
            {{ $t('account.subaccount') }}: {{ activeSubaccountLabel }}
          </span>

          <div
            class="transition-all duration-300 text-gray-500"
            :class="{ 'rotate-180': isOpen }"
          >
            <BaseIcon name="chevron-down" is-sm />
          </div>
        </button>
      </template>
    </CommonSubaccountSelector>

    <AppButtonSelect
      v-for="value in Object.values(SpotOrdersStandardView)"
      :key="value"
      v-model="view"
      v-bind="{ value }"
      class="flex items-center px-4 tab-field"
      active-classes="!text-white"
    >
      {{ $t(`activity.${value}`) }}
    </AppButtonSelect>
  </div>
</template>
