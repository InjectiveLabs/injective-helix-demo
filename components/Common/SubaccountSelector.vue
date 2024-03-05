<script setup lang="ts">
defineProps({
  includeBotsSubaccounts: Boolean,
  showLowBalance: Boolean
})

const accountStore = useAccountStore()

function changeSubaccount(subaccountId: string) {
  accountStore.$patch({ subaccountId })
}
</script>

<template>
  <CommonSubaccountOptions v-bind="{ includeBotsSubaccounts, showLowBalance }">
    <template #default="{ subaccountOptions, activeSubaccountLabel }">
      <BaseDropdown class="flex items-center" placement="bottom-start">
        <template #default="{ isOpen }">
          <slot v-bind="{ isOpen, activeSubaccountLabel }" />
        </template>

        <template #content="{ close }">
          <div
            class="bg-brand-900 border border-brand-700 text-white rounded-md overflow-hidden"
            @click="close"
          >
            <div
              v-for="subaccountId in subaccountOptions"
              :key="subaccountId.value"
              class="px-2 py-4 hover:bg-brand-800 text-sm font-semibold cursor-pointer"
              @click="changeSubaccount(subaccountId.value)"
            >
              Subaccount: {{ subaccountId.display }}
            </div>
          </div>
        </template>
      </BaseDropdown>
    </template>
  </CommonSubaccountOptions>
</template>
