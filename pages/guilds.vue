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
    campaignStore.fetchGuilds(),
    accountStore.streamBankBalance(),
    campaignStore.fetchUserGuildInfo(),
    accountStore.fetchAccountPortfolio()
  ])
    .catch($onError)
    .finally(() => status.setIdle())
})
</script>

<template>
  <AppHocLoading class="h-full container" v-bind="{ status }">
    <div class="mx-auto max-w-7xl w-full px-4 pt-20 pb-10">
      <PartialsGuildHeader
        v-if="campaignStore.guildCampaignSummary"
        v-bind="{ summary: campaignStore.guildCampaignSummary }"
      />
      <PartialsGuildLeaderboard class="mt-10" />
    </div>

    <PartialsGuildModalsAlreadyJoinedGuild />
    <PartialsGuildModalsCreateGuild v-bind="{ token: baseToken }" />
  </AppHocLoading>
</template>
