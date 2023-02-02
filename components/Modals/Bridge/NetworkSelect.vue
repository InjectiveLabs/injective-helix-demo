<script lang="ts" setup>
import { PropType } from 'vue'
import { BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { networksMeta } from '~/app/data/bridge'
import { BridgeType } from '@/types'

const props = defineProps({
  value: {
    type: String,
    required: true
  },

  bridgeType: {
    type: String as PropType<BridgeType>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:network', state: string): void
}>()

const options = computed(() => {
  // TODO: Remove injective option from options when depositing
  return networksMeta
    .filter((option) => {
      return props.bridgeType !== BridgeType.Withdraw
        ? option.value !== BridgingNetwork.Injective
        : true
    })
    .map((option) => {
      return {
        display: option.text,
        value: option.value,
        icon: option.icon
      }
    })
})

const value = computed({
  get(): string {
    return props.value
  },
  set(value: string) {
    emit('update:network', value)
  }
})
</script>

<template>
  <div class="relative">
    <h3 class="text-lg text-gray-200 mb-4">
      <slot name="title"></slot>
    </h3>

    <AppSelectField
      v-model="value"
      selected-class="h-20 bg-gray-1000"
      :options="options"
      :placeholder="$t('connect.selectDerivationPath')"
    >
      <template #selected-option="{ option }">
        <ModalsBridgeNetworkSelectOption
          v-if="option"
          selected
          :option="option"
        />
      </template>

      <template #option="{ option, active }">
        <ModalsBridgeNetworkSelectOption :option="option" :active="active" />
      </template>
    </AppSelectField>
  </div>
</template>
