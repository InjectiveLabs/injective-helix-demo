<script setup lang="ts">
const subaccountOptions = [
  { value: 'main', display: 'Main' },
  { value: 'subaccount1', display: 'Subaccount 1' },
  { value: 'subaccount2', display: 'Subaccount 2' }
]

function changeSubaccount(_subaccountId: string) {
  // console.log(subaccountId)
}
</script>

<template>
  <div class="h-header flex">
    <BaseDropdown :distance="0" class="flex" placement="bottom-start">
      <template #default="{}">
        <button class="flex items-center">
          {{ subaccountOptions[0].display }}
        </button>
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
    </BaseDropdown>
  </div>
</template>
