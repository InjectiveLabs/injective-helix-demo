<script setup lang="ts">
import { PerpOrdersStandardView } from '@/types'

const props = defineProps({
  modelValue: {
    type: String as PropType<PerpOrdersStandardView>,
    required: true
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: PerpOrdersStandardView]
}>()

const walletStore = useWalletStore()

const view = useVModel(props, 'modelValue', emit)

const filteredOptions = computed(() =>
  Object.values(PerpOrdersStandardView).filter(
    (value) =>
      walletStore.isUserWalletConnected ||
      value !== PerpOrdersStandardView.Balances
  )
)

watch(
  () => walletStore.isUserWalletConnected,
  (isConnected) => {
    if (!isConnected && view.value === PerpOrdersStandardView.Balances) {
      view.value = PerpOrdersStandardView.OpenOrders
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

    <div class="flex-1 flex items-center px-2 justify-end">
      <PartialsPortfolioOrdersFuturesOpenOrdersCancelAllOrders
        v-if="view === PerpOrdersStandardView.OpenOrders"
      />
    </div>
  </div>
</template>
