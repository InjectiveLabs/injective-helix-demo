<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { DerivativeTradeTypes } from '@/types'

const emit = defineEmits<{
  'trade-type:change': []
  'update:modelValue': [value: string]
}>()

const props = withDefaults(
  defineProps<{
    modelValue: string
  }>(),
  {}
)

const basicTradeTypes = [
  DerivativeTradeTypes.Limit,
  DerivativeTradeTypes.Market
]
const advancedTradeTypes = Object.values(DerivativeTradeTypes).filter(
  (type) => !basicTradeTypes.includes(type)
)

const orderType = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isAdvancedSelected = computed(() =>
  advancedTradeTypes.includes(orderType.value as DerivativeTradeTypes)
)

function onTradeTypeChange() {
  emit('trade-type:change')
}

function onTypeSelect(type: DerivativeTradeTypes) {
  orderType.value = type
  onTradeTypeChange()
}
</script>

<template>
  <div class="border-b max-lg:-mx-4 max-lg:-mt-2">
    <div class="flex items-center">
      <AppButtonSelect
        v-for="type in basicTradeTypes"
        :key="type"
        :value="type"
        :model-value="orderType"
        active-classes="border-b border-blue-550 text-white"
        class="flex-1 text-xs font-medium text-coolGray-450 px-4 py-2 hover:text-white"
        @click="onTypeSelect(type)"
      >
        {{ $t(`trade.${type}`) }}
      </AppButtonSelect>

      <div class="flex-1">
        <USelectMenu
          :model-value="isAdvancedSelected ? orderType : ''"
          :options="advancedTradeTypes"
          selected-icon=""
          :ui-menu="{
            ring: '',
            background: 'dark:bg-brand-925',
            option: { selected: '', base: 'capitalize dark:hover:bg-brand-875' }
          }"
          @update:model-value="onTypeSelect"
        >
          <template #default="{ open: isOpen }">
            <div
              :class="[
                'flex items-center justify-center text-xs font-medium px-4 py-2 transition-colors cursor-pointer',
                isAdvancedSelected
                  ? 'border-b border-blue-550 text-white'
                  : 'text-coolGray-450 hover:text-white'
              ]"
            >
              <span class="capitalize mr-1 whitespace-nowrap">
                {{
                  isAdvancedSelected
                    ? $t(`trade.${orderType}`)
                    : $t('trade.advanced')
                }}
              </span>
              <UIcon
                :name="NuxtUiIcons.ArrowDown2"
                :class="{ 'transform rotate-180': isOpen }"
                class="size-2.5 transition-transform"
              />
            </div>
          </template>
        </USelectMenu>
      </div>
    </div>
  </div>
</template>
