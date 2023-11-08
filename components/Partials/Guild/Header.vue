<script lang="ts" setup>
import { format, isSameYear, isSameMonth } from 'date-fns'
import { GuildCampaignSummary } from '@injectivelabs/sdk-ts'
import { Modal } from '@/types'

const modalStore = useModalStore()
const walletStore = useWalletStore()
const campaignStore = useCampaignStore()

const TOTAL_REWARDS = '10000'
const DATE_FORMAT = 'MMM dd, yyyy'
const DISCORD_LINK = 'https://discord.gg/injective'

const props = defineProps({
  summary: {
    type: Object as PropType<GuildCampaignSummary>,
    required: true
  }
})

const campaignDateRange = computed(() => {
  let startDate = format(props.summary.startTime, DATE_FORMAT)
  let endDate = format(props.summary.endTime, DATE_FORMAT)

  if (isSameYear(props.summary.startTime, props.summary.endTime)) {
    startDate = format(props.summary.startTime, 'MMM dd')
  }

  if (isSameMonth(props.summary.startTime, props.summary.endTime)) {
    endDate = format(props.summary.startTime, 'dd')
  }

  return `${startDate} - ${endDate}`
})

const { valueToString: totalRewardsToString } = useBigNumberFormatter(
  computed(() => TOTAL_REWARDS)
)

function openCreateGuildModal() {
  if (campaignStore.userGuildInfo) {
    modalStore.openModal(Modal.AlreadyJoinedGuild)

    return
  }

  modalStore.openModal(Modal.CreateGuild)
}
</script>

<template>
  <div>
    <h2 class="text-6xl font-bold uppercase">
      {{ $t('guild.title') }}
    </h2>
    <p class="text-lg">
      {{ $t('guild.description', { amount: totalRewardsToString }) }}
    </p>

    <div
      class="flex items-center gap-10 font-semibold text-2xl mt-10 flex-wrap"
    >
      <div class="space-y-2">
        <p class="text-sm text-gray-475">
          {{ $t('guild.guilds') }}
        </p>
        <p>{{ summary.totalGuildsCount }}</p>
      </div>

      <div class="space-y-2">
        <p class="text-sm text-gray-475">
          {{ $t('guild.participants') }}
        </p>
        <p>{{ summary.totalMembersCount }}</p>
      </div>

      <div class="space-y-2">
        <p class="text-sm text-gray-475">
          {{ $t('guild.totalRewards') }}
        </p>
        <p class="uppercase">{{ totalRewardsToString }} INJ</p>
      </div>

      <div class="space-y-2">
        <p class="text-sm text-gray-475">
          {{ $t('guild.currentSeason') }}
        </p>
        <p>{{ campaignDateRange }}</p>
      </div>
    </div>

    <div v-if="walletStore.isUserWalletConnected" class="mt-20">
      <h2 class="text-2xl font-bold">
        {{ $t('guild.howToParticipate.title') }}
      </h2>

      <section class="grid lg:grid-cols-2 gap-10 pt-6">
        <article class="bg-gray-900 p-8 text-center basis-1/2 rounded-lg">
          <img src="/guild/howToParticipate.svg" class="mx-auto" />
          <h2 class="text-2xl font-semibold max-w-sm mx-auto mt-3">
            {{ $t('guild.howToParticipate.createGuild.title') }}
          </h2>
          <p class="text-sm font-semibold mt-2">
            {{ $t('guild.howToParticipate.createGuild.description') }}
          </p>

          <AppButton
            class="bg-blue-500 text-white min-w-3xs mt-10"
            @click="openCreateGuildModal"
          >
            <span class="text-sm">
              {{ $t('guild.howToParticipate.createGuild.cta') }}
            </span>
          </AppButton>
        </article>

        <article class="bg-gray-900 p-8 text-center basis-1/2 rounded-lg">
          <img src="/guild/joinGuild.svg" class="mx-auto" />
          <h2 class="text-2xl font-semibold max-w-[364px] mx-auto mt-3">
            {{ $t('guild.howToParticipate.joinGuild.title') }}
          </h2>
          <p class="text-sm font-semibold mt-2">
            {{ $t('guild.howToParticipate.joinGuild.description') }}
          </p>

          <NuxtLink :to="DISCORD_LINK" target="_blank">
            <AppButton class="bg-blue-500 text-white min-w-3xs mt-10">
              <div class="text-sm">
                <span class="xs:hidden">
                  {{ $t('guild.howToParticipate.joinGuild.ctaMobile') }}
                </span>
                <span class="max-xs:hidden">
                  {{ $t('guild.howToParticipate.joinGuild.cta') }}
                </span>
              </div>
            </AppButton>
          </NuxtLink>
        </article>
      </section>
    </div>
  </div>
</template>
