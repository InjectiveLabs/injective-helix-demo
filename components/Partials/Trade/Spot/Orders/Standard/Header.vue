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
const isMobile = useIsMobile()
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

    <AppTabSelect
      v-if="isMobile"
      v-bind="{
        options: filteredOptions.map((value) => ({ display: value, value }))
      }"
      v-model="view"
      class="border-r"
    >
      <template #default="{ selected }">
        <button class="px-2">{{ $t(`activity.${selected?.value}`) }}</button>
      </template>

      <template #option="{ option }">
        <button>{{ $t(`activity.${option.value}`) }}</button>
      </template>
    </AppTabSelect>

    <AppButtonSelect
      v-for="value in filteredOptions"
      v-else
      :key="value"
      v-model="view"
      v-bind="{ value }"
      class="flex items-center px-4 tab-field"
      active-classes="!text-white"
    >
      {{ $t(`activity.${value}`) }}
    </AppButtonSelect>

    <div class="flex items-center flex-1 justify-end px-2">
      <PartialsPortfolioOrdersSpotOpenOrdersCancelAllOrders
        v-if="view === SpotOrdersStandardView.OpenOrders"
      />
    </div>
  </div>
</template>
