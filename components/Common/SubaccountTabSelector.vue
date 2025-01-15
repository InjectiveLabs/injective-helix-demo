<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { PortfolioCyTags } from '@/types'

const breakpoints = useSharedBreakpoints()
const sharedWalletStore = useSharedWalletStore()

const xxl = breakpoints['5xl']

withDefaults(
  defineProps<{
    isSm?: boolean
    wrapperClass?: string
    showLowBalance?: boolean
    includeBotsSubaccounts?: boolean
  }>(),
  {
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
        :class="[wrapperClass, { 'lg:px-4': !isSm && !xxl }]"
      >
        <span
          class="font-semibold text-blue-500"
          :class="{
            'text-xs': isSm && !xxl,
            'text-sm': !isSm || xxl
          }"
          :data-cy="dataCyTag(PortfolioCyTags.SubAccountDropdown)"
        >
          {{ $t('account.subaccount') }}: {{ activeSubaccountLabel }}
        </span>

        <div
          class="transition-all duration-300 text-coolGray-500"
          :class="{ 'rotate-180': isOpen }"
        >
          <UIcon :name="NuxtUiIcons.ChevronDown" class="h-3 w-3 min-w-3" />
        </div>
      </button>
    </template>
  </CommonSubaccountSelector>
</template>
