<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { Modal, DerivativeTradeTypes } from '@/types'
import type { BigNumberInBase } from '@injectivelabs/utils'

const modalStore = useSharedModalStore()

const emit = defineEmits<{
  'trade-type:change': []
  'update:modelValue': [value: string]
}>()

const props = withDefaults(
  defineProps<{
    modelValue: string
    worstPrice: BigNumberInBase
  }>(),
  {}
)

const leverage = ref('1')

const orderType = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function onTradeTypeChange() {
  emit('trade-type:change')
}

function openLeverageModal() {
  modalStore.openModal(Modal.Leverage)
}

function onLeverageUpdate(value: string) {
  leverage.value = value
}
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <span
      class="rounded-lg py-2.5 px-4 5xl:px-6 text-sm font-medium bg-[#124A73] hover:bg-[#124A73]/80 text-[#CFE5FF] transition-colors cursor-pointer"
      @click="openLeverageModal"
    >
      {{ $t('trade.leverageModal.leverageAt', { leverageAmount: leverage }) }}
    </span>

    <USelectMenu
      v-model="orderType"
      :options="Object.values(DerivativeTradeTypes)"
      selected-icon=""
      :ui-menu="{
        ring: '',
        background: 'dark:bg-[#1D2024]',
        option: { base: 'capitalize dark:hover:bg-brand-875' }
      }"
      @change="onTradeTypeChange"
    >
      <template #default="{ open: isOpen }">
        <div>
          <span class="text-xs font-semibold text-coolGray-200">
            {{ $t('trade.orderType') }}
          </span>

          <div
            class="flex items-center text-coolGray-300 hover:text-white transition-colors"
          >
            <span class="capitalize font-medium w-28">{{ orderType }}</span>
            <UIcon
              :name="NuxtUiIcons.ArrowDown2"
              :class="{ 'transform rotate-180': isOpen }"
              class="size-2.5 transition-transform"
            />
          </div>
        </div>
      </template>
    </USelectMenu>

    <ModalsLeverage
      v-bind="{ worstPrice }"
      @leverage:update="onLeverageUpdate"
    />
  </div>
</template>
