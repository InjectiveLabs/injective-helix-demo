<script lang="ts" setup>
const accountStore = useAccountStore()
const { subaccount, subaccountSelectOptions } = useSubaccounts()

// const emit = defineEmits<{
//   'update:subaccount': [subaccount: string]
// }>()
</script>

<template>
  <div v-if="accountStore.hasMultipleSubaccounts" class="xl:ml-right xl:flex">
    <AppSelect
      v-model="subaccount"
      :options="subaccountSelectOptions"
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
  </div>
</template>
