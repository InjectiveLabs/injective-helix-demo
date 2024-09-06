<script setup lang="ts">
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
      <SharedDropdown :distance="0" class="flex" placement="bottom-start">
        <template #default="{ isOpen }">
          <slot v-bind="{ isOpen, activeSubaccountLabel }" />
        </template>

        <template #content="{ close }">
          <div
            class="bg-brand-900 border border-brand-700 text-white overflow-hidden"
            @click="close"
          >
            <div
              v-for="subaccountId in subaccountOptions"
              :key="subaccountId.value"
              class="px-6 py-4 hover:bg-brand-800 text-sm font-semibold cursor-pointer"
              @click="changeSubaccount(subaccountId.value)"
            >
              {{ $t('account.subaccount') }}: {{ subaccountId.display }}
            </div>
          </div>
        </template>
      </SharedDropdown>
    </template>
  </CommonSubaccountOptions>
</template>
