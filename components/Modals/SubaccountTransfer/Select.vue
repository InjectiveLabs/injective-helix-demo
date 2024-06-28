<script lang="ts" setup>
import { getSubaccountId } from '@injectivelabs/sdk-ts'
import { SubaccountTransferField } from '@/types'
import {
  addBaseSubaccountIndexToAddress,
  getSubaccountIndex,
  isSgtSubaccountId
} from '@/app/utils/helpers'

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

const newSubaccountId = computed(() =>
  getSubaccountId(
    sharedWalletStore.injectiveAddress,
    newSubaccountIdIndex.value
  )
)

const sourceOptions = computed(() =>
  subaccountsWithoutSgt.value
    .sort((a, b) => a.localeCompare(b))
    .map((subaccountId) => {
      const subaccountIdIndex = getSubaccountIndex(subaccountId)

      return {
        display:
          subaccountIdIndex === 0
            ? t('account.mainSubaccount')
            : t('account.subaccountId', { subaccountId: subaccountIdIndex }),
        value: subaccountId
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
        display:
          subaccountIdIndex === 0
            ? t('account.mainSubaccount')
            : t('account.subaccountId', { subaccountId: subaccountIdIndex }),
        value: subaccountId
      }
    })

  return [
    ...existingSubaccountIds,
    {
      display: t('account.subaccountId', {
        subaccountId: newSubaccountIdIndex.value
      }),
      value: addBaseSubaccountIndexToAddress(
        sharedWalletStore.address,
        newSubaccountIdIndex.value
      )
    }
  ]
})

onMounted(() => {
  const [destinationOption] = destinationOptions.value

  setDstSubaccountIdValue(destinationOption.value)
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
  <div class="relative flex items-center w-full">
    <div class="flex-1">
      <AppSelectField
        v-model="srcSubaccountId"
        selected-class="h-12 bg-gray-1000"
        :options="sourceOptions"
        @update:model-value="onSourceSubaccountIdUpdate"
      >
        <template #selected-option="{ option }">
          <span>{{ option?.display }}</span>
        </template>

        <template #option="{ option, isActive }">
          <span
            :class="{
              'font-bold text-gray-100': isActive,
              'text-gray-300': !isActive
            }"
          >
            {{ option.display }}
          </span>
        </template>
      </AppSelectField>
    </div>
    <div class="px-4">
      <div
        class="bg-blue-500 min-w-6 h-6 mx-6 flex items-center justify-center rounded-full"
        data-cy="transfer-modal-direction-toggle-button"
      >
        <SharedIcon
          name="arrow"
          class="text-gray-1000 w-6 h-6 rotate-180 select-none"
        />
      </div>
    </div>
    <div class="flex-1">
      <AppSelectField
        v-model="dstSubaccountId"
        selected-class="h-12 bg-gray-1000"
        :options="destinationOptions"
        @update:model-value="onDestinationSubaccountIdUpdate"
      >
        <template #selected-option="{ option }">
          <span>{{ option?.display }}</span>
        </template>

        <template #option="{ option, isActive }">
          <span class="whitespace-nowrap">
            <span
              v-if="option.value === newSubaccountId"
              :class="{ 'font-bold': isActive }"
              class="text-gray-100"
            >
              <span>{{ option.display }}</span>
              <span
                class="bg-blue-500 ml-2 font-semibold tracking-wide text-xs px-1 py-px rounded-sm"
              >
                {{ t('common.new') }}
              </span>
            </span>

            <span
              v-else
              class="text-gray-100"
              :class="{
                'font-bold text-gray-100': isActive
              }"
            >
              {{ option.display }}
            </span>
          </span>
        </template>
      </AppSelectField>
    </div>
  </div>
</template>
