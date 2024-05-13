<script setup lang="ts">
const walletStore = useWalletStore()
</script>

<template>
  <CommonSubaccountSelector
    v-if="walletStore.isUserWalletConnected"
    show-low-balance
  >
    <template #default="{ isOpen, activeSubaccountLabel }">
      <button
        v-show="activeSubaccountLabel"
        class="flex items-center space-x-2 px-4 border-r hover:bg-brand-800"
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
          <SharedIcon name="chevron-down" is-sm />
        </div>
      </button>
    </template>
  </CommonSubaccountSelector>
</template>
