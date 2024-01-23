<script lang="ts" setup>
import {
  isSgtSubaccountId,
  getSubaccountIndex,
  getMarketSlugFromSubaccountId
} from '@/app/utils/helpers'

const route = useRoute()
const accountStore = useAccountStore()
const { t } = useLang()

const emit = defineEmits<{
  'update:subaccount': [subaccount: string]
}>()

const isSpotOrFuturesRoute = computed(() =>
  ['spot', 'futures'].some((r) => (route.name as string).startsWith(r))
)

const subaccountSelectOptions = computed(() =>
  accountStore.hasMultipleSubaccounts
    ? Object.keys(accountStore.subaccountBalancesMap)
        .filter((subaccountId) =>
          isSpotOrFuturesRoute.value ? !isSgtSubaccountId(subaccountId) : true
        )
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
