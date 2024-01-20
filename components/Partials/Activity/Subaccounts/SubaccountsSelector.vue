<script lang="ts" setup>
import {
  isSgtSubaccountId,
  getSubaccountIndex,
  getMarketSlugFromSubaccountId
} from '@/app/utils/helpers'

const accountStore = useAccountStore()
const { t } = useLang()

const emit = defineEmits<{
  'update:subaccount': [subaccount: string]
}>()

const subaccountSelectOptions = computed(() =>
  accountStore.hasMultipleSubaccounts
    ? Object.keys(accountStore.subaccountBalancesMap)
        .map((value) => {
          if (getSubaccountIndex(value) === 0) {
            return { display: `${t('account.main')}`, value }
          }

          if (isSgtSubaccountId(value)) {
            return {
              value,
              display: `SGT ${getMarketSlugFromSubaccountId(value)}`
            }
          }

          return {
            value,
            display: getSubaccountIndex(value).toString()
          }
        })
        .sort((a, b) => a.value.localeCompare(b.value))
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
      :wrapper-class="`bg-white/10 px-4 py-2 rounded-lg`"
    >
      <template #default="{ selected }">
        <span v-if="selected" class="text-md text-gray-300 font-semibold">
          {{ $t('account.account') }}:
          <span class="uppercase">{{ selected.display }}</span>
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
