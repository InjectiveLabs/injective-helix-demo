<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

import { amplitudeGridStrategyTracker } from '@/app/providers/amplitude/GridStrategyTracker'
import { durationFormatter } from 'app/utils/helpers'

const props = defineProps({
  createdAt: {
    type: String,
    required: true
  },

  pnl: {
    type: String,
    required: true
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
    .removeStrategy()
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
        totalProfit: props.pnl
      })
    })
}
</script>

<template>
  <slot v-bind="{ removeStrategy, status }" />
</template>
