<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

const exchangeStore = useExchangeStore()
const { poolCampaignScheduleList } = useTradeReward()
const { $onError } = useNuxtApp()
const { t } = useLang()

const status = reactive(new Status(StatusType.Loading))

const schedules = computed(() => poolCampaignScheduleList.value || [])

onMounted(() => {
  Promise.all([exchangeStore.fetchPendingTradeRewardPoints()])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <div>
    <AppHocLoading :status="status">
      <div>
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-200">
            {{ $t('tradeAndEarn.pendingRewards') }}
          </h3>
        </div>

        <div v-if="schedules.length === 0">
          <span className="text-gray-500">
            {{ t('tradeAndEarn.emptyPendingRewards') }}
          </span>
        </div>

        <PartialsTradeAndEarnPendingRewardsEpoch
          v-for="(schedule, index) in schedules"
          :key="`pending-rewards-epoch-${index}`"
          :class="index > 0 ? 'mt-12' : 'mt-0'"
          :schedule="schedule"
          :index="index"
        />
      </div>
    </AppHocLoading>
  </div>
</template>
