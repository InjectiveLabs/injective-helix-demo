<script setup lang="ts">
const sharedWalletStore = useSharedWalletStore()

withDefaults(
  defineProps<{
    includeBotsSubaccounts?: boolean
    showLowBalance?: boolean
    wrapperClass?: string
  }>(),
  {
    showLowBalance: false,
    wrapperClass: ''
  }
)
</script>

<template>
  <CommonSubaccountSelector
    v-if="sharedWalletStore.isUserConnected"
    v-bind="{
      showLowBalance,
      includeBotsSubaccounts
    }"
  >
    <template #default="{ isOpen, activeSubaccountLabel }">
      <button
        v-show="activeSubaccountLabel"
        class="flex items-center space-x-2 px-2 lg:px-4 hover:bg-brand-800 max-lg:py-2"
        :class="wrapperClass"
      >
        <span
          class="text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent"
        >
          {{ $t('account.subaccount') }}: {{ activeSubaccountLabel }}
        </span>

        <div
          class="transition-all duration-300 text-gray-500"
          :class="{ 'rotate-180': isOpen }"
        >
          <SharedIcon name="chevron-down" is-sm />
        </div>
      </button>
    </template>
  </CommonSubaccountSelector>
</template>
