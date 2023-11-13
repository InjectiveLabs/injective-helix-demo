<script setup lang="ts">
import { format } from 'date-fns'
import { Campaign } from '@injectivelabs/sdk-ts'
import { UiMarketWithToken } from 'types'
import { LP_EPOCHS } from 'app/data/guild'

const props = defineProps({
  epoch: {
    type: String,
    required: true
  },

  campaign: {
    type: Object as PropType<Campaign>,
    required: true
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    default: undefined
  }
})

const emit = defineEmits<{
  'update:epoch': [value: string]
}>()

const epochModel = computed({
  get: () => props.epoch,
  set: (value) => emit('update:epoch', value)
})

const epochOptions = computed(() =>
  LP_EPOCHS.filter(({ startDate }) => startDate < Date.now()).map((ep) => ({
    display: `EPOCH ${ep.epoch}`,
    value: ep.epoch.toString()
  }))
)

const epoch = computed(() =>
  LP_EPOCHS.find(({ campaignId }) => campaignId === props.campaign.campaignId)
)

const DATE_FORMAT = "MMM dd - hh a 'UTC' X"
const BLOG_POST_URL =
  'https://helixapp.zendesk.com/hc/en-us/articles/8258846181647-Share-30-000-TIA-in-TIA-Spot-Trading-Challenge-'

const { valueToString: injRewardsToString } = useBigNumberFormatter(
  computed(() => epoch.value?.baseRewards),
  { decimalPlaces: 0 }
)

const { valueToString: tiaRewardsToString } = useBigNumberFormatter(
  computed(() => epoch.value?.quoteRewards),
  { decimalPlaces: 0 }
)

const endDate = computed(() => format(props.campaign.endDate, DATE_FORMAT))
</script>

<template>
  <div class="flex mt-8">
    <div class="flex-1">
      <div class="pb-4 flex justify-between">
        <div>
          <h2 class="text-3xl font-bold">
            {{ $t('campaign.title') }}
          </h2>
          <p>{{ $t('campaign.description') }}</p>

          <NuxtLink
            :to="BLOG_POST_URL"
            target="_blank"
            class="inline-block leading-5 py-2 px-5 font-semibold whitespace-nowrap text-white bg-blue-500 rounded-lg mt-4"
          >
            {{ $t('campaign.campaignRules') }}
          </NuxtLink>
        </div>

        <div class="flex items-start">
          <AppSelect
            v-model="epochModel"
            start-placement
            v-bind="{
              options: epochOptions,
              wrapperClass: 'border px-4 py-1 rounded'
            }"
          >
            <template #default="{ selected }">
              <span class="font-bold select-none">
                {{ selected?.display }}
              </span>
            </template>

            <template #option="{ option }">
              <span class="font-bold">
                {{ option.display }}
              </span>
            </template>
          </AppSelect>
        </div>
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[auto_auto_auto] gap-2 mt-4"
      >
        <div>
          <p class="text-gray-600 text-sm mb-2">
            {{ $t('campaign.totalRewards') }}
          </p>
          <h2 class="text-2xl font-semibold">
            {{ injRewardsToString }} INJ + {{ tiaRewardsToString }} TIA
          </h2>
        </div>
        <div v-if="market">
          <p class="text-gray-600 text-sm mb-2">
            {{ $t('campaign.eligibleMarkets') }}
          </p>
          <h2 class="text-2xl font-semibold">{{ market.ticker }}</h2>
        </div>
        <div>
          <p class="text-gray-600 text-sm mb-2">
            {{ $t('campaign.endTime') }}
          </p>
          <h2 class="text-2xl font-semibold">{{ endDate }}</h2>
        </div>
      </div>
    </div>

    <div class="hidden sm:block pl-4">
      <img src="/svg/leaderboard_graphic.svg" />
    </div>
  </div>
</template>
