<script lang="ts" setup>
import { BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { networksMeta } from '@/app/data/bridge'
import { BridgeField, BridgeForm } from '@/types'

const formValues = useFormValues<BridgeForm>()

const { isWithdraw } = useBridgeState({
  formValues
})

const { value: network } = useStringField({
  name: BridgeField.BridgingNetwork
})
/**
 * We remove injective option from options when depositing
 **/
const options = computed(() => {
  return networksMeta
    .filter((option) => {
      if (isWithdraw.value) {
        return true
      }

      return option.value !== BridgingNetwork.Injective
    })
    .map((option) => {
      return {
        display: option.text,
        value: option.value,
        icon: option.icon
      }
    })
})
</script>

<template>
  <div class="relative">
    <h3 class="text-lg text-gray-200 mb-4">
      <slot name="title"></slot>
    </h3>

    <AppSelectField
      v-model="network"
      selected-class="h-20 bg-gray-1000"
      :options="options"
      :placeholder="$t('bridge.selectOriginNetwork')"
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
