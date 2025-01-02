<script setup lang="ts">
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { NuxtUiIcons } from '@shared/types'

import { Status, StatusType } from '@injectivelabs/utils'

const props = defineProps<{
  strategy: TradingStrategy
}>()

const toast = useToast()
const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))

function removeStrategy() {
  status.setLoading()

  gridStrategyStore
    .removeStrategyForSubaccount(
      props.strategy.contractAddress,
      props.strategy.subaccountId
    )
    .then(() => {
      toast.add({
        title: t('sgt.success'),
        description: t('sgt.gridStrategyRemovedSuccessfully'),
        icon: NuxtUiIcons.Checkmark
      })

      // Optimistically remove the strategy from the state
      gridStrategyStore.$patch((state) => {
        state.strategies = state.strategies.filter(
          (strategy) =>
            strategy.contractAddress !== props.strategy.contractAddress &&
            strategy.subaccountId !== props.strategy.subaccountId
        )
      })
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <slot v-bind="{ status, removeStrategy }">
    <SharedButton :loading="status.isLoading()" @click="removeStrategy">
      {{ $t('sgt.removeStrategy') }}
    </SharedButton>
  </slot>
</template>
