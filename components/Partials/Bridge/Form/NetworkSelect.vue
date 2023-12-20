<script lang="ts" setup>
import { BridgingNetwork, CosmosNetworks } from '@injectivelabs/sdk-ui-ts'
import { networksMeta } from '@/app/data/bridge'
import { BridgeField, BridgeForm } from '@/types'

const formValues = useFormValues<BridgeForm>() as Ref<BridgeForm>

const { isTransfer } = useBridgeState(formValues)

const emit = defineEmits<{
  'ibc:connect': [state: BridgingNetwork]
}>()

const { value: network } = useStringField({
  name: BridgeField.BridgingNetwork
})

/**
 * We only need Injective as a network when we do on
 * chain transfer to another address
 **/
const options = computed(() => {
  if (isTransfer.value) {
    return networksMeta
      .filter((option) => {
        return option.value === BridgingNetwork.Injective
      })
      .map((option) => {
        return {
          display: option.text,
          value: option.value,
          icon: option.icon
        }
      })
  }

  return networksMeta
    .filter((option) => {
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

function onNetworkChange(network: string) {
  if (!CosmosNetworks.includes(network as BridgingNetwork)) {
    return
  }

  emit('ibc:connect', network as BridgingNetwork)
}
</script>

<template>
  <div class="relative">
    <h3 class="text-lg text-gray-200 mb-4">
      <slot name="title"></slot>
    </h3>

    <AppSelectField
      v-model="network"
      v-bind="$attrs"
      selected-class="h-20 bg-gray-1000"
      :options="options"
      :placeholder="$t('bridge.selectOriginNetwork')"
      @update:modelValue="onNetworkChange"
    >
      <template #selected-option="{ option }">
        <PartialsBridgeFormNetworkSelectOption
          v-if="option"
          is-selected
          :option="option"
        />
      </template>

      <template #option="{ option, isActive }">
        <PartialsBridgeFormNetworkSelectOption
          v-bind="{
            option,
            isActive
          }"
        />
      </template>
    </AppSelectField>
  </div>
</template>
