<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { MainPage } from '@/types'
import type { CampaignV2 } from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    campaign: CampaignV2
  }>(),
  {}
)

const now = useNow({ interval: 1000 })

const isEndedCampaign = computed(() => {
  if (!props.campaign) {
    return true
  }

  return new BigNumberInBase(now.value.getTime()).gte(props.campaign.endDate)
})
</script>

<template>
  <div
    class="relative rounded-lg mb-10 border-coolGray-375 border-[3px] flex justify-between overflow-hidden bg-[#131519]"
  >
    <div
      v-if="isEndedCampaign"
      class="absolute top-2 right-2 sm:top-3 sm:right-3 py-0.5 sm:py-1 px-1 sm:px-2 bg-coolGray-650 rounded uppercase text-xs sm:text-sm font-semibold"
    >
      {{ $t('common.ended') }}
    </div>

    <div
      class="relative px-6 xl:px-10 flex flex-col items-start py-6 xl:py-9 flex-1 tracking-[0.4px]"
    >
      <div class="text-left text-4xl font-black italic max-2xl:max-w-xl mb-4">
        {{ $t('banners.leaderboard.volumeVictory.title') }}
      </div>

      <div class="text-left text-base max-w-lg 2xl:max-w-xl opacity-90 mb-10">
        <span class="xl:leading-5">
          {{ $t('banners.leaderboard.volumeVictory.description') }}
        </span>
      </div>

      <NuxtLink
        target="_blank"
        :to="{ name: MainPage.VolumeVictoryCompetitionTerms }"
        class="text-left text-xs font-medium text-white hover:text-blue-500 transition-colors"
      >
        {{ $t('leaderboard.competition.rulesTermsAndConditionsApply') }}
      </NuxtLink>
    </div>

    <img
      src="/images/leaderboard/volume-victory.webp"
      class="hidden xl:block w-[450px] absolute -right-12 -bottom-7"
    />
  </div>
</template>
