<script lang="ts" setup>
import { format } from 'date-fns'
import { Status, StatusType } from '@injectivelabs/utils'

const accountStore = useAccountStore()
const campaignStore = useCampaignStore()
const { $onError } = useNuxtApp()
const { baseToken } = useGuild()

const DATE_FORMAT = 'yyyy-MM-dd hh:mm:ss'

const now = ref(Date.now())
const status = reactive(new Status(StatusType.Loading))

onWalletConnected(() => {
  Promise.all([
    campaignStore.fetchGuildsByTVL(),
    accountStore.fetchCw20Balances(),
    campaignStore.fetchUserGuildInfo(),
    campaignStore.fetchGuildsByVolume(),
    accountStore.fetchAccountPortfolioBalances()
  ])
    .catch($onError)
    .finally(() => status.setIdle())
})

const lastUpdated = computed(() => {
  if (!campaignStore.guildCampaignSummary) {
    return
  }

  return format(campaignStore.guildCampaignSummary.updatedAt, DATE_FORMAT)
})

useIntervalFn(
  () =>
    Promise.all([
      campaignStore.fetchGuildsByTVL(),
      campaignStore.fetchGuildsByVolume()
    ]),
  30 * 1000
)

useIntervalFn(() => (now.value = Date.now()), 1000)
</script>

<template>
  <AppHocLoading v-bind="{ status }" is-full-screen>
    <div class="mx-auto max-w-7xl w-full px-4 pt-20 pb-12">
      <PartialsGuildHeader
        v-bind="{ now, summary: campaignStore.guildCampaignSummary }"
      />

      <section class="mt-10">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold mb-6">
            {{ $t('guild.leaderboard.title') }}
          </h2>

          <p v-if="lastUpdated" class="text-coolGray-300 p-2 text-xs">
            {{ $t('guild.leaderboard.lastUpdated', { date: lastUpdated }) }}
          </p>
        </div>
        <section class="grid lg:grid-cols-2 gap-10">
          <PartialsGuildLeaderboard v-bind="{ now }" />
          <PartialsGuildLeaderboard v-bind="{ now, isVolume: true }" />
        </section>
      </section>
    </div>

    <PartialsGuildModalsAlreadyJoinedGuild />
    <PartialsGuildModalsCreateGuild v-bind="{ token: baseToken }" />
  </AppHocLoading>
</template>
