<script lang="ts" setup>
import { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'

const derivativeStore = useDerivativeStore()
const positionStore = usePositionStore()
const spotStore = useSpotStore()

defineProps({
  status: {
    type: Object as PropType<Status>,
    default: () => new Status(StatusType.Idle)
  }
})
</script>

<template>
  <div class="overflow-x-auto hide-scrollbar flex-none">
    <div class="flex lg:grid grid-cols-4 gap-4">
      <CommonCardLink
        v-bind="{
          to: { name: 'activity-positions' },
          showLoading: status.isLoading()
        }"
      >
        <template #icon>
          {{ positionStore.subaccountPositionsCount }}
        </template>

        <span> {{ $t('activity.positions') }}</span>
      </CommonCardLink>

      <CommonCardLink
        v-bind="{
          to: { name: 'activity-derivatives' },
          showLoading: status.isLoading()
        }"
      >
        <template #icon>
          {{ derivativeStore.subaccountOrdersCount }}
        </template>

        <span>{{ $t('activity.derivativeOrders') }}</span>
      </CommonCardLink>

      <CommonCardLink
        v-bind="{
          to: { name: 'activity-spot' },
          showLoading: status.isLoading()
        }"
      >
        <template #icon>
          <span>{{ spotStore.subaccountOrdersCount }}</span>
        </template>
        <span>{{ $t('activity.spotOrders') }}</span>
      </CommonCardLink>

      <CommonCardLink
        v-bind="{
          to: { name: 'activity-wallet-history' }
        }"
      >
        <template #icon>
          <BaseIcon name="wallet" class="w-3 md:w-3.5 h-auto" />
        </template>
        {{ $t('activity.walletHistory') }}
      </CommonCardLink>
    </div>
  </div>
</template>
