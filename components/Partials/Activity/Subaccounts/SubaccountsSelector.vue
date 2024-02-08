<script lang="ts" setup>
import { isSgtSubaccountId } from '@/app/utils/helpers'
import { ActivitySubPage } from '@/types'

const accountStore = useAccountStore()
const { subaccount, subaccountOptions } = useSubaccounts(
  computed(() => ({ includeBotsSubaccounts: true, showLowBalance: true }))
)

const router = useRouter()

function onUpdateSubaccount(subaccountId: string) {
  if (isSgtSubaccountId(subaccountId)) {
    router.replace({ name: ActivitySubPage.Spot })
  }
}
</script>

<template>
  <div v-if="accountStore.hasMultipleSubaccounts" class="xl:ml-right xl:flex">
    <AppSelect
      v-model="subaccount"
      :options="subaccountOptions"
      class="self-end"
      :wrapper-class="`bg-white/10 px-4 py-2 rounded-lg`"
      @update:model-value="onUpdateSubaccount"
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
