<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import {
  isSgtSubaccountId,
  getSubaccountIndex,
  addBaseSubaccountIndexToAddress
} from '@/app/utils/helpers'
import { SubaccountTransferField } from '@/types'

const accountStore = useAccountStore()
const sharedWalletStore = useSharedWalletStore()
const { t } = useLang()

const emit = defineEmits<{
  'update:subaccountId': []
}>()

const { value: srcSubaccountId } = useStringField({
  name: SubaccountTransferField.SrcSubaccountId
})

const { value: dstSubaccountId, setValue: setDstSubaccountIdValue } =
  useStringField({
    name: SubaccountTransferField.DstSubaccountId
  })

const subaccountsWithoutSgt = computed(() =>
  Object.keys(accountStore.subaccountBalancesMap).filter(
    (subaccountId) =>
      !isSgtSubaccountId(subaccountId) &&
      parseInt(subaccountId.slice(42), 16) < 100
  )
)

const newSubaccountIdIndex = computed(() => subaccountsWithoutSgt.value.length)

const sourceOptions = computed(() =>
  subaccountsWithoutSgt.value
    .sort((a, b) => a.localeCompare(b))
    .map((subaccountId) => {
      const subaccountIdIndex = getSubaccountIndex(subaccountId)

      return {
        label:
          subaccountIdIndex === 0
            ? t('common.account.mainSubaccount')
            : t('common.account.subaccountId', {
                subaccountId: subaccountIdIndex
              }),
        id: subaccountId
      }
    })
)

const destinationOptions = computed(() => {
  const existingSubaccountIds = subaccountsWithoutSgt.value
    .sort((a, b) => a.localeCompare(b))
    .filter((subaccountId) => subaccountId !== srcSubaccountId.value)
    .map((subaccountId) => {
      const subaccountIdIndex = getSubaccountIndex(subaccountId)

      return {
        label:
          subaccountIdIndex === 0
            ? t('common.account.mainSubaccount')
            : t('common.account.subaccountId', {
                subaccountId: subaccountIdIndex
              }),
        id: subaccountId
      }
    })

  return [
    ...existingSubaccountIds,
    {
      label: t('common.account.subaccountId', {
        subaccountId: newSubaccountIdIndex.value
      }),
      id: addBaseSubaccountIndexToAddress(
        sharedWalletStore.address,
        newSubaccountIdIndex.value
      )
    }
  ]
})

onMounted(() => {
  const [destinationOption] = destinationOptions.value

  setDstSubaccountIdValue(destinationOption.id)
})

function onSourceSubaccountIdUpdate(subaccountId: string) {
  if (subaccountId === dstSubaccountId.value) {
    const updatedSubaccountId = Object.keys(
      accountStore.subaccountBalancesMap
    ).find((value) => value !== subaccountId)

    if (updatedSubaccountId) {
      setDstSubaccountIdValue(updatedSubaccountId)
    }
  }

  emit('update:subaccountId')
}

function onDestinationSubaccountIdUpdate() {
  emit('update:subaccountId')
}
</script>

<template>
  <div class="relative flex items-center w-full flex-wrap gap-2">
    <div class="flex-1">
      <USelectMenu
        v-model="srcSubaccountId"
        color="cool-gray"
        :options="sourceOptions"
        value-attribute="id"
        @update:model-value="onSourceSubaccountIdUpdate"
      />
    </div>
    <div class="px-4">
      <div
        class="bg-blue-500 min-w-6 h-6 mx-6 flex items-center justify-center rounded-full"
        data-cy="transfer-modal-direction-toggle-button"
      >
        <UIcon
          :name="NuxtUiIcons.ArrowLeft"
          class="text-coolGray-950 w-6 h-6 rotate-180 select-none"
        />
      </div>
    </div>
    <div class="flex-1">
      <USelectMenu
        v-model="dstSubaccountId"
        color="cool-gray"
        :options="destinationOptions"
        value-attribute="id"
        @update:model-value="onDestinationSubaccountIdUpdate"
      />
    </div>
  </div>
</template>
