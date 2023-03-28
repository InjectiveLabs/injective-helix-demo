<script lang="ts" setup>
const accountStore = useAccountStore()
const { t } = useLang()

const emit = defineEmits<{
  (e: 'update:subaccount', subaccount: string): void
}>()

const subaccountSelectOptions = computed(() =>
  accountStore.hasMultipleSubaccounts
    ? Object.keys(accountStore.subaccountBalancesMap).map((value, index) => ({
        value,
        display: index === 0 ? `${t('account.main')}` : index.toString()
      }))
    : []
)

const subaccount = computed({
  get: (): string => accountStore.subaccountId,
  set: (value: string) => {
    accountStore.$patch({
      subaccountId: value
    })

    nextTick(() => {
      emit('update:subaccount', value)
    })
  }
})
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
