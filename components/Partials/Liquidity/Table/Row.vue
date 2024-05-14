<script setup lang="ts">
import {
  Status,
  StatusType,
  BigNumberInWei,
  BigNumberInBase
} from '@injectivelabs/utils'
import { usdtToken } from '@shared/data/token'
import { Campaign } from '@injectivelabs/sdk-ts'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import {
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  CURRENT_MARKET_TO_LEGACY_MARKET_ID_MAP
} from '@/app/utils/constants'
import { spotGridMarkets } from '@/app/data/grid-strategy'
import { toBalanceInToken } from '@/app/utils/formatters'
import { LiquidityRewardsPage, TradingBotsSubPage } from '@/types'

const props = defineProps({
  campaign: {
    type: Object as PropType<Campaign>,
    required: true
  }
})

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const campaignStore = useCampaignStore()
const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()

const activeBots = ref<number>(0)
const status = reactive(new Status(StatusType.Loading))

const market = computed(() =>
  spotStore.markets.find(({ marketId }) => marketId === props.campaign.marketId)
)

const baseToken = computed(() => {
  if (!market.value) {
    return
  }

  return tokenStore.tokenBySymbol(market.value.baseToken.symbol)
})

const rewardsWithToken = computed(() =>
  props.campaign.rewards.map((reward) => {
    const token = tokenStore.tokenByDenomOrSymbol(reward.denom)

    return {
      value: toBalanceInToken({
        value: reward.amount,
        decimalPlaces: token?.decimals || 18
      }),
      token
    }
  })
)

const marketVolume = computed(() =>
  new BigNumberInWei(props.campaign.totalScore || 0).toBase(
    market.value?.quoteToken.decimals || usdtToken.decimals
  )
)

const { valueToString: totalRewardsInUsdToString } =
  useSharedBigNumberFormatter(
    computed(() =>
      rewardsWithToken.value.reduce((total, reward) => {
        return total.plus(
          new BigNumberInBase(reward.value).times(
            tokenStore.tokenUsdPrice(reward.token)
          )
        )
      }, ZERO_IN_BASE)
    ),
    { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
  )

const { valueToString: marketVolumeInUsdToString } =
  useSharedBigNumberFormatter(
    computed(() =>
      marketVolume.value.times(
        market.value ? tokenStore.tokenUsdPrice(market.value.quoteToken) : 0
      )
    ),
    { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
  )

const sgtScAddress = computed(() => {
  const market = spotStore.markets.find(
    ({ marketId }) => marketId === props.campaign.marketId
  )

  const scAddress =
    spotGridMarkets.find((sgt) => sgt.slug === market?.slug)?.contractAddress ||
    ''

  return scAddress
})

const userHasActiveLegacyStrategy = computed(() =>
  gridStrategyStore.activeStrategies.find(
    (strategy) =>
      strategy.marketId ===
      CURRENT_MARKET_TO_LEGACY_MARKET_ID_MAP[props.campaign.marketId]
  )
)

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
      <div class="flex items-center space-x-2">
        <NuxtLink
          :to="{
            name: TradingBotsSubPage.GridSpotMarket,
            params: { market: market.slug }
          }"
          class="flex items-center space-x-2 hover:bg-gray-800 rounded-md transition-colors duration-300 p-2"
        >
          <div v-if="baseToken">
            <CommonTokenIcon v-bind="{ token: baseToken }" />
          </div>
          <div>
            <p class="text-sm font-bold">{{ market.ticker }}</p>
            <p class="text-xs text-gray-500">
              {{ market.baseToken.name }}
            </p>
          </div>
        </NuxtLink>

        <AppTooltip
          v-if="userHasActiveLegacyStrategy"
          is-warning
          :content="$t('sgt.legacyBotWarning')"
          is-lg
        />
      </div>
    </td>

    <td class="text-left">
      <div>
        <p class="font-semibold text-base mb-2">
          {{ totalRewardsInUsdToString }} USD
        </p>
        <div class="flex items-center space-x-2">
          <template v-for="(reward, index) in rewardsWithToken" :key="index">
            <PartialsLiquidityCommonTokenAmount
              v-if="reward.token"
              v-bind="{
                amount: reward.value,
                symbol: reward.token.symbol,
                index
              }"
            />
          </template>
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
            query: { campaign: campaign.campaignId }
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
