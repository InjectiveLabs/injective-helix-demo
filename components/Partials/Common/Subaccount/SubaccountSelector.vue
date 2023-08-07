<script lang="ts" setup>
import {
  addSubacountIdToEthAddress,
  getSubaccountIndex
} from '@/app/utils/helpers'
import { spotGridMarketsWithSubaccount } from '@/app/utils/constants/grid-spot-trading'

const walletStore = useWalletStore()
const accountStore = useAccountStore()
const { t } = useLang()

const emit = defineEmits<{
  'update:subaccount': [subaccount: string]
}>()

const subaccountSelectOptions = computed(() =>
  accountStore.hasMultipleSubaccounts
    ? Object.keys(accountStore.subaccountBalancesMap)
        .map((value) => {
          const isSpotGridSubaccount = spotGridMarketsWithSubaccount.find(
            (spotGrid) =>
              addSubacountIdToEthAddress(
                walletStore.address,
                spotGrid.subaccountId
              ) === value
          )

          let display

          if (getSubaccountIndex(value) === 0) {
            display = `${t('account.main')}`
          } else if (isSpotGridSubaccount) {
            display = `SGT ${isSpotGridSubaccount.slug}`
          } else {
            display = getSubaccountIndex(value).toString()
          }

          return {
            value,
            display
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
