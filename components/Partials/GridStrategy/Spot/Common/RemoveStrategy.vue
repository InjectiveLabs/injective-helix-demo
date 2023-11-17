<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

import { amplitudeGridStrategyTracker } from '@/app/providers/amplitude/GridStrategyTracker'
import { durationFormatter } from '@/app/utils/helpers'

const props = defineProps({
  isLiquidity: Boolean,

  createdAt: {
    type: String,
    required: true
  },

  pnl: {
    type: String,
    required: true
  },

  contractAddress: {
    type: String,
    default: undefined
  }
})

const gridStrategyStore = useGridStrategyStore()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))

function removeStrategy() {
  status.setLoading()

  gridStrategyStore
    .removeStrategy(props.contractAddress)
    .then(() => {
      success({
        title: t('sgt.success'),
        description: t('sgt.strategyRemoved')
      })
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()

      amplitudeGridStrategyTracker.removeStrategy({
        duration: durationFormatter(props.createdAt, Date.now()),
        market: gridStrategyStore.spotMarket?.slug || '',
        totalProfit: props.pnl,
        isLiquidity: props.isLiquidity
      })
    })
}
</script>

<template>
  <slot v-bind="{ removeStrategy, status }" />
</template>
