<script lang="ts" setup>
import { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { ActivityTab } from '@/types'

const derivativeStore = useDerivativeStore()
const positionStore = usePositionStore()
const spotStore = useSpotStore()

const props = defineProps({
  tab: {
    type: String as PropType<ActivityTab>,
    required: true
  },

  status: {
    type: Object as PropType<Status>,
    default: () => new Status(StatusType.Idle)
  }
})

const emit = defineEmits<{
  (e: 'update:tab', state: string): void
}>()

const activeTab = computed({
  get: (): ActivityTab => props.tab,
  set: (tab: ActivityTab) => {
    emit('update:tab', tab)
  }
})
</script>

<template>
  <div class="overflow-x-auto hide-scrollbar flex-none">
    <div class="flex lg:grid grid-cols-4 gap-4">
      <AppSelectButton
        v-for="tabOption in Object.values(ActivityTab)"
        :key="`activity-tab-${tabOption}`"
        v-model="activeTab"
        :value="tabOption"
      >
        <template #default="{ active }">
          <CommonCardSelect
            data-cy="activity-open-positions-panel"
            :active="active"
            :show-loading="active && status.isLoading()"
          >
            <template #icon>
              <span class="font-semibold text-sm md:text-lg">
                <span v-if="tabOption === ActivityTab.Positions">
                  {{ positionStore.subaccountPositionsCount }}
                </span>
                <span v-else-if="tabOption === ActivityTab.Derivatives">
                  {{ derivativeStore.subaccountOrdersCount }}
                </span>
                <span v-else-if="tabOption === ActivityTab.Spot">
                  {{ spotStore.subaccountOrdersCount }}
                </span>
                <span v-else-if="tabOption === ActivityTab.WalletHistory">
                  <BaseIcon name="wallet" class="w-3 md:w-3.5 h-auto" />
                </span>
              </span>
            </template>

            <span class="text-sm whitespace-nowrap">
              <span v-if="tabOption === ActivityTab.Positions">
                {{ $t('activity.positions') }}
              </span>
              <span v-else-if="tabOption === ActivityTab.Derivatives">
                {{ $t('activity.derivativeOrders') }}
              </span>
              <span v-else-if="tabOption === ActivityTab.Spot">
                {{ $t('activity.spotOrders') }}
              </span>
              <span v-else-if="tabOption === ActivityTab.WalletHistory">
                {{ $t('activity.walletHistory') }}
              </span>
            </span>
          </CommonCardSelect>
        </template>
      </AppSelectButton>
    </div>
  </div>
</template>
