<script setup lang="ts">
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { CampaignWithSc, LiquidityRewardsPage } from '@/types'

const props = defineProps({
  campaignWithSc: {
    type: Object as PropType<CampaignWithSc>,
    required: true
  }
})

const spotStore = useSpotStore()
const tokenStore = useTokenStore()

const market = computed(() =>
  spotStore.markets.find(({ slug }) => slug === props.campaignWithSc.marketSlug)
)

const token = computed(() =>
  tokenStore.tokens.find(
    ({ coinGeckoId }) => market.value?.baseToken.coinGeckoId === coinGeckoId
  )
)

const rewardsWithToken = computed(() =>
  props.campaignWithSc.rewards.map((r) => ({
    value: new Intl.NumberFormat('en-US').format(Number(r.amount)),
    token: tokenStore.tokens.find((t) => t.symbol === r.symbol)
  }))
)

const totalRewardsInUsd = computed(() => {
  return props.campaignWithSc.rewards.reduce((total, reward) => {
    const token = tokenStore.tokens.find((t) => t.symbol === reward.symbol)
    if (!token) {
      return total
    }

    const rewardInUsd = new BigNumberInBase(reward.amount).times(
      tokenStore.tokenUsdPriceMap[token.coinGeckoId]
    )

    return total.plus(rewardInUsd)
  }, ZERO_IN_BASE)
})

const marketSummary = computed(() =>
  spotStore.marketsSummary.find(
    (summary) => summary.marketId === market.value?.marketId
  )
)

const marketVolume = computed(
  () => new BigNumberInBase(marketSummary.value?.volume || 0)
)

const { valueToString: totalRewardsInUsdToString } = useBigNumberFormatter(
  totalRewardsInUsd,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToString: marketVolumeToString } = useBigNumberFormatter(
  marketVolume,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)
</script>

<template>
  <tr v-if="market" class="text-right text-sm">
    <td class="text-left">
      <div class="flex items-center space-x-2">
        <div v-if="token">
          <CommonTokenIcon v-bind="{ token }" />
        </div>
        <div>
          <p class="text-sm font-bold">{{ market.ticker }}</p>
          <p class="text-xs text-gray-500">
            {{ market.baseToken.name }}
          </p>
        </div>
      </div>
    </td>

    <td class="text-left">
      <div>
        <p class="font-semibold text-base mb-2">
          {{ totalRewardsInUsdToString }} USD
        </p>
        <div class="flex items-center space-x-2">
          <div
            v-for="(reward, i) in rewardsWithToken"
            :key="`${reward.token}-${reward.value}`"
            class="flex items-center space-x-2"
          >
            <p v-if="i > 0">+</p>
            <CommonTokenIcon
              v-if="reward.token"
              is-sm
              v-bind="{ token: reward.token }"
            />
            <p class="text-xs text-gray-400">
              {{ reward.value }} {{ reward?.token?.symbol }}
            </p>
          </div>
        </div>
      </div>
    </td>

    <td v-if="false">
      <div>
        <p>8.23% Weekly</p>
        <p>8.23% Yearly</p>
      </div>
    </td>

    <td v-if="false">
      <div>
        <p>100 USD</p>
      </div>
    </td>

    <td>
      <div>
        <p>{{ marketVolumeToString }} USD</p>
      </div>
    </td>

    <td>
      <div>
        <NuxtLink
          class="text-blue-500"
          :to="{
            name: LiquidityRewardsPage.CampaignDetails,
            query: { campaign: campaignWithSc.campaignId }
          }"
        >
          {{ $t('campaign.details') }}
        </NuxtLink>
      </div>
    </td>
  </tr>
</template>

<style scoped>
td > div {
  @apply px-2 py-4;
}
</style>
