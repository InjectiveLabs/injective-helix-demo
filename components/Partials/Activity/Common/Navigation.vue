<script lang="ts" setup>
import { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { ActivityTab } from '@/types'

const derivativeStore = useDerivativeStore()
const positionStore = usePositionStore()
const spotStore = useSpotStore()

const props = defineProps({
  status: {
    type: Object as PropType<Status>,
    default: () => new Status(StatusType.Idle)
  }
})
</script>

<template>
  <div class="overflow-x-auto hide-scrollbar flex-none">
    <div class="flex lg:grid grid-cols-4 gap-4">
      <CommonCardLink v-bind="{ to: { name: 'activity-positions' } }">
        Positions
      </CommonCardLink>
      <CommonCardLink v-bind="{ to: { name: 'activity-derivatives' } }">
        Derivative Orders
      </CommonCardLink>
      <CommonCardLink v-bind="{ to: { name: 'activity-spot' } }">
        Spot Orders
      </CommonCardLink>
      <CommonCardLink v-bind="{ to: { name: 'activity-wallet-history' } }">
        Wallet History
      </CommonCardLink>
    </div>
  </div>
</template>
