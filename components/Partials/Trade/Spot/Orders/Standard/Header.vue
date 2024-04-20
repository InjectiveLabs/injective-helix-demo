<script setup lang="ts">
import { SpotOrdersStandardView } from '@/types'

const props = defineProps({
  modelValue: {
    type: String as PropType<SpotOrdersStandardView>,
    required: true
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: SpotOrdersStandardView]
}>()

const walletStore = useWalletStore()

const view = useVModel(props, 'modelValue', emit)

const filteredOptions = computed(() =>
  Object.values(SpotOrdersStandardView).filter(
    (value) =>
      walletStore.isUserWalletConnected ||
      value !== SpotOrdersStandardView.Balances
  )
)

watch(
  () => walletStore.isUserWalletConnected,
  (isConnected) => {
    if (!isConnected && view.value === SpotOrdersStandardView.Balances) {
      view.value = SpotOrdersStandardView.OpenOrders
    }
  }
)
</script>

<template>
  <div class="h-header border-b flex">
    <CommonSubaccountTabSelector />

    <AppButtonSelect
      v-for="value in filteredOptions"
      :key="value"
      v-model="view"
      v-bind="{ value }"
      class="flex items-center px-4 tab-field"
      active-classes="!text-white"
    >
      {{ $t(`activity.${value}`) }}
    </AppButtonSelect>
  </div>
</template>
