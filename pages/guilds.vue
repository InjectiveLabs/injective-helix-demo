<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { IS_DEVNET } from 'app/utils/constants'

const tokenStore = useTokenStore()
const accountStore = useAccountStore()
const campaignStore = useCampaignStore()
const { $onError } = useNuxtApp()

const TOKEN_SYMBOL = IS_DEVNET ? 'INJ' : 'TIA'

const status = reactive(new Status(StatusType.Loading))

const baseToken = computed(() =>
  tokenStore.tokens.find(({ symbol }) => symbol === TOKEN_SYMBOL)
)

onWalletConnected(() => {
  Promise.all([
    campaignStore.fetchGuildsByTVL(),
    accountStore.streamBankBalance(),
    campaignStore.fetchUserGuildInfo(),
    campaignStore.fetchGuildsByVolume(),
    accountStore.fetchAccountPortfolio()
  ])
    .catch($onError)
    .finally(() => status.setIdle())
})

useIntervalFn(
  () =>
    Promise.all([
      campaignStore.fetchGuildsByTVL(),
      campaignStore.fetchGuildsByVolume()
    ]),
  30 * 1000
)
</script>

<template>
  <AppHocLoading class="h-full container" v-bind="{ status }">
    <div class="mx-auto max-w-7xl w-full px-4 pt-20 pb-12">
      <PartialsGuildHeader
        v-if="campaignStore.guildCampaignSummary"
        v-bind="{ summary: campaignStore.guildCampaignSummary }"
      />

      <section class="mt-10">
        <h2 class="text-2xl font-bold mb-6">
          {{ $t('guild.leaderboard.title') }}
        </h2>
        <section class="grid lg:grid-cols-2 gap-10">
          <PartialsGuildLeaderboard />
          <PartialsGuildLeaderboard is-volume />
        </section>
      </section>
    </div>

    <PartialsGuildModalsAlreadyJoinedGuild />
    <PartialsGuildModalsCreateGuild v-bind="{ token: baseToken }" />
  </AppHocLoading>
</template>
