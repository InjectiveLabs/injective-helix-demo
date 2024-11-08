<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

const exchangeStore = useExchangeStore()
const { $onError } = useNuxtApp()
const { t } = useLang()

const status = reactive(new Status(StatusType.Loading))

const schedules = computed(
  () => useTradeReward().pendingPoolCampaignScheduleList.value || []
)

onMounted(() => {
  Promise.all([exchangeStore.fetchPendingTradeRewardPoints()])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <div class="relative">
    <div>
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-coolGray-200">
          {{ $t(`tradeAndEarn.pendingRewards`) }}
        </h3>
      </div>

      <div v-if="schedules.length === 0">
        <span className="text-coolGray-500">
          {{ t('tradeAndEarn.emptyPendingRewards') }}
        </span>
      </div>

      <div class="relative">
        <AppHocLoading :status="status">
          <PartialsTradeAndEarnPendingRewardsEpoch
            v-for="(schedule, index) in schedules"
            :key="`pending-rewards-epoch-${index}`"
            :class="index > 0 ? 'mt-12' : 'mt-0'"
            :schedule="schedule"
            :index="index"
          />
        </AppHocLoading>
      </div>
    </div>
  </div>
</template>
