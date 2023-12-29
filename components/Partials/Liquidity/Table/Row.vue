<script setup lang="ts">
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import {
  BigNumberInBase,
  BigNumberInWei,
  Status,
  StatusType
} from '@injectivelabs/utils'
import {
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  USDT_DECIMALS
} from '@/app/utils/constants'
import {
  CampaignWithScAndData,
  LiquidityRewardsPage,
  TradingBotsSubPage
} from '@/types'
import { spotGridMarkets } from '~/app/data/grid-strategy'

const props = defineProps({
  campaignWithSc: {
    type: Object as PropType<CampaignWithScAndData>,
    required: true
  }
})

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const campaignStore = useCampaignStore()
const { $onError } = useNuxtApp()

const activeBots = ref<number>(0)
const status = reactive(new Status(StatusType.Loading))

const market = computed(() =>
  spotStore.markets.find(({ slug }) => slug === props.campaignWithSc.marketSlug)
)

const token = computed(() =>
  tokenStore.tokens.find(
    ({ symbol }) => market.value?.baseToken.symbol === symbol
  )
)

const rewardsWithToken = computed(() =>
  props.campaignWithSc.rewards.map((reward) => ({
    value: new BigNumberInBase(reward.amount).toFormat(
      UI_DEFAULT_MIN_DISPLAY_DECIMALS
    ),
    token: tokenStore.tokens.find(({ symbol }) => symbol === reward.symbol)
  }))
)

const totalRewardsInUsd = computed(() => {
  return props.campaignWithSc.rewards.reduce((total, reward) => {
    const token = tokenStore.tokens.find(
      ({ symbol }) => symbol === reward.symbol
    )

    if (!token) {
      return total
    }

    const rewardInUsd = new BigNumberInBase(reward.amount).times(
      tokenStore.tokenUsdPrice(token)
    )

    return total.plus(rewardInUsd)
  }, ZERO_IN_BASE)
})

const marketVolume = computed(() =>
  new BigNumberInWei(
    campaignStore.campaignsWithSc.find(
      (c) => c.campaignId === props.campaignWithSc.campaignId
    )?.totalScore || 0
  ).toBase(market.value?.quoteToken.decimals || USDT_DECIMALS)
)

const marketVolumeInUsd = computed(() =>
  marketVolume.value.times(
    market.value ? tokenStore.tokenUsdPrice(market.value.quoteToken) : 0
  )
)

const { valueToString: totalRewardsInUsdToString } = useBigNumberFormatter(
  totalRewardsInUsd,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const { valueToString: marketVolumeInUsdToString } = useBigNumberFormatter(
  marketVolumeInUsd,
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
)

const sgtScAddress = computed(() => {
  const campaignWords = props.campaignWithSc.campaignId.split('-')
  const slug = campaignWords[2] + '-' + campaignWords[3]

  const address = spotGridMarkets.find((sc) => sc.slug === slug)
    ?.contractAddress

  return address
})

onMounted(() => {
  status.setLoading()

  campaignStore
    .fetchActiveStrategiesOnSmartContract(sgtScAddress.value)

    .then((response) => {
      activeBots.value = response
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <tr v-if="market" class="text-right text-sm">
    <td class="text-left">
      <NuxtLink
        :to="{
          name: TradingBotsSubPage.GridSpotMarket,
          params: { market: campaignWithSc.marketSlug }
        }"
        class="flex items-center space-x-2 hover:bg-gray-800 rounded-md transition-colors duration-300 p-2"
      >
        <div v-if="token">
          <CommonTokenIcon v-bind="{ token }" />
        </div>
        <div>
          <p class="text-sm font-bold">{{ market.ticker }}</p>
          <p class="text-xs text-gray-500">
            {{ market.baseToken.name }}
          </p>
        </div>
      </NuxtLink>
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

    <td>
      <div>
        <span v-if="status.isLoading()" class="text-gray-500">&mdash;</span>
        <span v-else>{{ activeBots }}</span>
      </div>
    </td>

    <td>
      <div>
        <p>{{ marketVolumeInUsdToString }} USD</p>
      </div>
    </td>

    <td>
      <div class="flex space-x-8 justify-end">
        <NuxtLink
          class="text-blue-500"
          :to="{
            name: LiquidityRewardsPage.CampaignDetails,
            query: { campaign: campaignWithSc.campaignId }
          }"
        >
          {{ $t('campaign.rewardsDetails') }}
        </NuxtLink>

        <NuxtLink
          class="text-blue-500"
          :to="{
            name: TradingBotsSubPage.LiquiditySpotMarket,
            query: { market: market.slug }
          }"
        >
          {{ $t('campaign.addLiquidity') }}
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
