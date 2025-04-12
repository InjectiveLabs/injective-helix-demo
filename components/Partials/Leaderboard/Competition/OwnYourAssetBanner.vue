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
    class="relative rounded-lg mb-10 border-coolGray-375 border-[3px] flex justify-between overflow-hidden"
  >
    <div
      v-if="isEndedCampaign"
      class="absolute top-2 right-2 sm:top-3 sm:right-3 py-0.5 sm:py-1 px-1 sm:px-2 bg-coolGray-650 rounded uppercase text-xs sm:text-sm font-semibold"
    >
      {{ $t('leaderboard.competition.ownYourAssetBanner.ended') }}
    </div>

    <div
      class="relative px-6 xl:px-10 flex flex-col space-y-4 xl:space-y-6 items-start py-6 xl:py-9 flex-1 tracking-[0.4px]"
    >
      <div class="text-left text-4xl font-black italic max-2xl:max-w-xl">
        {{ $t('leaderboard.competition.ownYourAssetBanner.title') }}
      </div>

      <div class="text-left text-base max-w-lg 2xl:max-w-xl opacity-90">
        <i18n-t
          tag="span"
          keypath="leaderboard.competition.ownYourAssetBanner.description"
          class="xl:leading-5"
        >
          <template #blog>
            <NuxtLink
              to="http://blog.helixapp.com/trade-responsibly-helixs-50k-trading-giveaway"
              target="_blank"
              class="border-b border-b-white hover:text-blue-500 hover:border-b-blue-500"
            >
              {{ $t('leaderboard.competition.ownYourAssetBanner.blog') }}
            </NuxtLink>
          </template>
        </i18n-t>
      </div>

      <NuxtLink
        :to="{ name: MainPage.OwnYourAssetCompetitionTerms }"
        target="_blank"
        class="text-left text-xs xl:text-sm hover:text-blue-500 hover:border-b-blue-500 opacity-70"
      >
        {{ $t('leaderboard.competition.termsAndConditionsApply') }}
      </NuxtLink>
    </div>

    <img
      src="/images/leaderboard/own-your-asset.webp"
      class="hidden xl:block w-[450px] absolute -right-12 -bottom-7"
    />
  </div>
</template>
