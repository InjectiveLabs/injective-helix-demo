<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { Modal, DerivativeTradeTypes, DerivativesTradeFormField } from '@/types'
import type { DerivativesTradeForm } from '@/types'
import type { BigNumberInBase } from '@injectivelabs/utils'

const modalStore = useSharedModalStore()
const derivativeFormValues = useFormValues<DerivativesTradeForm>()

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
</script>

<template>
  <div class="flex items-center justify-between">
    <span
      class="rounded-lg py-2.5 px-4 5xl:px-6 w-1/2 text-center text-sm font-medium bg-[#124A73] hover:bg-[#124A73]/80 text-[#CFE5FF] transition-colors cursor-pointer"
      @click="openLeverageModal"
    >
      {{
        $t('trade.leverageModal.leverageAt', {
          leverageAmount:
            derivativeFormValues[DerivativesTradeFormField.Leverage]
        })
      }}
    </span>

    <div class="max-lg:w-1/2 max-lg:flex max-lg:justify-center">
      <USelectMenu
        v-model="orderType"
        :options="Object.values(DerivativeTradeTypes)"
        selected-icon=""
        :ui-menu="{
          ring: '',
          background: 'dark:bg-[#1D2024]',
          option: { selected: '', base: 'capitalize dark:hover:bg-brand-875' }
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
              <span
                class="capitalize font-medium w-[101px] 5xl:w-[108px] max-5xl:text-sm"
              >
                {{ orderType }}
              </span>
              <UIcon
                :name="NuxtUiIcons.ArrowDown2"
                :class="{ 'transform rotate-180': isOpen }"
                class="size-2.5 transition-transform"
              />
            </div>
          </div>
        </template>
      </USelectMenu>
    </div>

    <ModalsLeverage v-bind="{ worstPrice }" />
  </div>
</template>
