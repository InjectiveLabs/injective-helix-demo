<script lang="ts" setup>
import { format, isSameYear, isSameMonth } from 'date-fns'
import { GuildCampaignSummary } from '@injectivelabs/sdk-ts'
import {
  GUILD_MIN_AMOUNT,
  GUILD_DISCORD_LINK,
  GUILD_ZENDESK_LINK
} from '@/app/utils/constants'
import { Modal } from '@/types'

const modalStore = useSharedModalStore()
const campaignStore = useCampaignStore()
const sharedWalletStore = useSharedWalletStore()

const TOTAL_INJ_REWARDS = '1,000'
const TOTAL_TIA_REWARDS = '10,000'
const DATE_FORMAT = 'MMM dd, yyyy'

const props = withDefaults(
  defineProps<{
    now: number
    summary?: GuildCampaignSummary
  }>(),
  {
    summary: undefined
  }
)

const campaignDateRange = computed(() => {
  if (!props.summary) {
    return
  }

  let endDate = format(props.summary.endTime, DATE_FORMAT)
  let startDate = format(props.summary.startTime, DATE_FORMAT)

  if (isSameYear(props.summary.startTime, props.summary.endTime)) {
    startDate = format(props.summary.startTime, 'MMM dd')
  }

  if (isSameMonth(props.summary.startTime, props.summary.endTime)) {
    endDate = format(props.summary.startTime, 'dd')
  }

  return `${startDate} - ${endDate}`
})

const isCampaignOver = computed(() => {
  if (!props.summary) {
    return false
  }

  return props.summary.endTime < props.now
})

function openCreateGuildModal() {
  if (campaignStore.userGuildInfo) {
    modalStore.openModal(Modal.AlreadyJoinedGuild)

    return
  }

  modalStore.openModal(Modal.CreateGuild)
}

function onConnectWallet() {
  modalStore.openModal(Modal.Connect)
}
</script>

<template>
  <div>
    <section class="text-center">
      <h2 class="text-6xl font-bold uppercase">
        {{ $t('guild.title') }}
      </h2>
      <p class="text-lg max-w-screen-sm mx-auto">
        {{ $t('guild.description') }}
      </p>

      <div
        class="flex items-center justify-center gap-10 font-semibold text-2xl mt-10 flex-wrap"
      >
        <div class="space-y-2">
          <p class="text-sm text-coolGray-475">
            {{ $t('guild.guilds') }}
          </p>
          <p v-if="summary">{{ summary.totalGuildsCount }}</p>
          <p v-else>&mdash;</p>
        </div>

        <div class="space-y-2">
          <p class="text-sm text-coolGray-475">
            {{ $t('guild.participants') }}
          </p>
          <p v-if="summary">{{ summary.totalMembersCount }}</p>
          <p v-else>&mdash;</p>
        </div>

        <div class="space-y-2">
          <p class="text-sm text-coolGray-475">
            {{ $t('guild.totalRewards') }}
          </p>
          <p v-if="campaignDateRange">
            {{ TOTAL_INJ_REWARDS }} INJ + {{ TOTAL_TIA_REWARDS }} TIA
          </p>
          <p v-else>&mdash;</p>
        </div>

        <div class="space-y-2">
          <p class="text-sm text-coolGray-475">
            {{ $t('guild.currentSeason') }}
          </p>
          <p v-if="campaignDateRange">{{ campaignDateRange }}</p>
          <p v-else>&mdash;</p>
        </div>
      </div>
    </section>

    <p class="max-w-4xl mx-auto mt-8">{{ $t('guild.rewardDescription1') }}</p>

    <p class="max-w-4xl mx-auto mt-4">{{ $t('guild.rewardDescription2') }}</p>

    <PartialsGuildHeaderCountdown
      v-if="summary"
      v-bind="{ now, summary }"
      class="mt-8"
    />

    <section class="mt-20">
      <div class="flex justify-between items-center gap-10">
        <h2 class="text-2xl font-bold">
          {{ $t('guild.howToParticipate.title') }}
        </h2>

        <NuxtLink :to="GUILD_ZENDESK_LINK" target="_blank">
          <AppButton>
            <div class="flex items-center gap-1">
              <span>{{ $t('guild.campaignRules') }}</span>
            </div>
          </AppButton>
        </NuxtLink>
      </div>

      <section class="grid lg:grid-cols-2 gap-10 pt-6">
        <article
          class="bg-coolGray-900 p-8 text-center basis-1/2 rounded-lg flex flex-col"
        >
          <div class="grow">
            <img src="/guild/howToParticipate.svg" class="mx-auto" />
            <h2 class="text-2xl font-semibold max-w-sm mx-auto mt-3">
              {{ $t('guild.howToParticipate.createGuild.title') }}
            </h2>
            <p class="text-sm font-semibold mt-2">
              {{
                $t('guild.howToParticipate.createGuild.description', {
                  amount: GUILD_MIN_AMOUNT
                })
              }}
            </p>
          </div>

          <div>
            <AppButton
              v-if="!sharedWalletStore.isUserConnected"
              class="bg-blue-500 text-blue-900 min-w-3xs mt-10"
              @click="onConnectWallet"
            >
              <span class="text-sm">{{ $t('connect.connectWallet') }}</span>
            </AppButton>

            <AppButton
              v-else
              class="bg-blue-500 text-blue-900 min-w-3xs mt-10 text-sm"
              :disabled="isCampaignOver"
              @click="openCreateGuildModal"
            >
              <span v-if="isCampaignOver" class="text-coolGray-600">
                {{ $t('guild.seasonEnded') }}
              </span>
              <span v-else>
                {{ $t('guild.howToParticipate.createGuild.cta') }}
              </span>
            </AppButton>
          </div>
        </article>

        <article class="bg-coolGray-900 p-8 text-center basis-1/2 rounded-lg">
          <img src="/guild/joinGuild.svg" class="mx-auto" />
          <h2 class="text-2xl font-semibold max-w-[364px] mx-auto mt-3">
            {{ $t('guild.howToParticipate.joinGuild.title') }}
          </h2>
          <p class="text-sm font-semibold mt-2">
            {{ $t('guild.howToParticipate.joinGuild.description') }}
          </p>
          <p class="text-sm font-semibold mt-2">
            {{ $t('guild.howToParticipate.joinGuild.description2') }}
          </p>

          <NuxtLink :to="GUILD_DISCORD_LINK" target="_blank">
            <AppButton
              class="bg-blue-500 text-blue-900 min-w-3xs mt-10 text-sm"
              :disabled="isCampaignOver"
            >
              <span v-if="isCampaignOver" class="text-coolGray-600">
                {{ $t('guild.seasonEnded') }}
              </span>
              <span v-else>
                {{ $t('guild.howToParticipate.joinGuild.cta') }}
              </span>
            </AppButton>
          </NuxtLink>
        </article>
      </section>
    </section>
  </div>
</template>
