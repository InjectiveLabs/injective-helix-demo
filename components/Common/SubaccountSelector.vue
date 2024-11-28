<script setup lang="ts">
import { PortfolioCyTags } from '@/types'
withDefaults(
  defineProps<{ showLowBalance?: boolean; includeBotsSubaccounts?: boolean }>(),
  { showLowBalance: false, includeBotsSubaccounts: false }
)

const accountStore = useAccountStore()

function changeSubaccount(subaccountId: string) {
  accountStore.updateSubaccount(subaccountId)
}
</script>

<template>
  <CommonSubaccountOptions v-bind="{ includeBotsSubaccounts, showLowBalance }">
    <template #default="{ subaccountOptions, activeSubaccountLabel }">
      <UPopover
        class="flex"
        :popper="{ placement: 'bottom-start', offsetDistance: 0 }"
      >
        <template #default="{ open }">
          <slot v-bind="{ isOpen: open, activeSubaccountLabel }" />
        </template>

        <template #panel="{ close }">
          <div class="max-h-[300px] overflow-y-auto divide-y" @click="close">
            <button
              v-for="subaccountId in subaccountOptions"
              :key="subaccountId.value"
              class="px-6 py-4 hover:bg-brand-800 text-sm font-semibold cursor-pointer block w-full text-start"
              :data-cy="`${dataCyTag(
                PortfolioCyTags.SubAccountDropdownOptions
              )}`"
              @click="changeSubaccount(subaccountId.value)"
            >
              {{ $t('account.subaccount') }}: {{ subaccountId.display }}
            </button>
          </div>
        </template>
      </UPopover>
    </template>
  </CommonSubaccountOptions>
</template>
