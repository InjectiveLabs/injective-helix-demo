<script lang="ts" setup>
const accountStore = useAccountStore()

const { subaccount } = useSubaccounts()
</script>

<template>
  <div v-if="accountStore.hasMultipleSubaccounts" class="xl:ml-right xl:flex">
    <CommonSubaccountOptions v-bind="{ showLowBalance: true }">
      <template #default="{ subaccountOptions }">
        <AppSelect
          v-model="subaccount"
          :options="subaccountOptions"
          class="self-end"
        >
          <template #default="{ selected }">
            <span v-if="selected" class="text-xs text-blue-500 uppercase">
              {{ selected.display }}
            </span>
          </template>

          <template #option="{ option }">
            <span class="text-xs uppercase text-white">
              {{ option.display }}
            </span>
          </template>
        </AppSelect>
      </template>
    </CommonSubaccountOptions>
  </div>
</template>
