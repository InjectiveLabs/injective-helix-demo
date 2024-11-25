<script lang="ts" setup>
import { CampaignV2 } from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MainPage } from '@/types'

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
    class="relative rounded-lg md:h-64 lg:h-80 mb-10 border-coolGray-375 border-[3px] flex justify-between"
  >
    <div
      class="absolute inset-0 bg-[url('/images/leaderboard/tesla.webp')] bg-cover bg-no-repeat md:bg-none opacity-10 bg-center"
    />

    <div
      v-if="isEndedCampaign"
      class="absolute top-2 right-2 sm:top-3 sm:right-3 py-0.5 sm:py-1 px-1 sm:px-2 bg-coolGray-650 rounded uppercase text-xs sm:text-sm font-semibold"
    >
      {{ $t('leaderboard.competition.teslaBanner.ended') }}
    </div>
    <div
      class="relative px-6 xl:px-10 flex flex-col space-y-4 xl:space-y-6 items-start py-6 xl:pt-12 flex-1 tracking-[0.4px]"
    >
      <div
        class="text-left text-4xl xl:text-5xl font-bold uppercase font-orbitron"
      >
        {{ $t('leaderboard.competition.teslaBanner.title') }}
      </div>

      <div
        class="text-left text-sm xl:text-xl max-w-lg 2xl:max-w-xl font-proximaNova opacity-90"
      >
        <i18n-t
          tag="span"
          keypath="leaderboard.competition.teslaBanner.description"
          class="xl:leading-5"
        >
          <template #blog>
            <NuxtLink
              to="https://blog.helixapp.com/like-a-g/"
              target="_blank"
              class="border-b border-b-white hover:text-blue-500 hover:border-b-blue-500"
            >
              {{ $t('leaderboard.competition.teslaBanner.blog') }}
            </NuxtLink>
          </template>
        </i18n-t>
      </div>

      <NuxtLink
        :to="{ name: MainPage.LikeAGCompetitionTerms }"
        target="_blank"
        class="text-left text-xs xl:text-sm hover:text-blue-500 hover:border-b-blue-500 font-pingFang opacity-70"
      >
        {{ $t('leaderboard.competition.termsAndConditionsApply') }}
      </NuxtLink>
    </div>

    <img
      src="/images/leaderboard/tesla.webp"
      class="hidden md:block object-contain max-md:flex-1 md:rounded-r-lg"
    />
  </div>
</template>
