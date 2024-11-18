<script setup lang="ts">
import { TradingStrategy } from '@injectivelabs/sdk-ts'

import { Status, StatusType } from '@injectivelabs/utils'

const props = defineProps<{
  strategy: TradingStrategy
}>()

const gridStrategyStore = useGridStrategyStore()
const status = reactive(new Status(StatusType.Idle))
const { $onError } = useNuxtApp()

function removeStrategy() {
  status.setLoading()

  gridStrategyStore
    .removeStrategyForSubaccount(
      props.strategy.contractAddress,
      props.strategy.subaccountId
    )
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <slot v-bind="{ status, removeStrategy }">
    <SharedButton :loading="status.isLoading()" @click="removeStrategy">
      Remove Strategy
    </SharedButton>
  </slot>
</template>
