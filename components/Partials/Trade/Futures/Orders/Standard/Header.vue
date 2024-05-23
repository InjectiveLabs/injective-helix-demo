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
const isMobile = useIsMobile()

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
  <div class="h-header border-b flex divide-x">
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

    <div class="flex-1 hidden lg:flex items-center px-2 justify-end">
      <PartialsPortfolioOrdersFuturesOpenOrdersCancelAllOrders
        v-if="view === PerpOrdersStandardView.OpenOrders"
      />

      <PartialsPortfolioOrdersFuturesTriggersCancelAllTriggers
        v-if="view === PerpOrdersStandardView.Triggers"
      />
    </div>

    <div class="flex-1 lg:hidden" />
  </div>
</template>
