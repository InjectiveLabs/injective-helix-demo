<script setup lang="ts">
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import {
  GridMarket,
  TradeSubPage,
  LiquidityProvisionType,
  TradingInterface
} from '@/types'

const props = withDefaults(
  defineProps<{
    gridMarket: GridMarket
  }>(),
  {}
)

const spotStore = useSpotStore()
const campaignStore = useCampaignStore()
const { $onError } = useNuxtApp()

const activeBots = ref(ZERO_IN_BASE)
const status = reactive(new Status(StatusType.Loading))

const market = computed(() =>
  spotStore.markets.find((market) => market.slug === props.gridMarket.slug)
)

const url = computed(() => ({
  name: TradeSubPage.Spot,
  query: {
    interface: TradingInterface.TradingBots
  },
  params: {
    slug: props.gridMarket.slug
  }
}))

onMounted(() => {
  status.setLoading()

  campaignStore
    .fetchActiveStrategiesOnSmartContract(props.gridMarket.contractAddress)
    .then((res) => {
      activeBots.value = new BigNumberInBase(res)
    })
    .catch($onError)
    .finally(() => status.setIdle())
})
</script>

<template>
  <PartialsLiquidityProvisionItem
    v-if="market"
    v-bind="{
      url,
      title: market.ticker,
      description: $t(
        `liquidityProvision.item.type.${LiquidityProvisionType.HelixSpotGridBot}`
      )
    }"
  >
    <template #default>
      <CommonTokenIcon is-lg v-bind="{ token: market?.baseToken }" />
    </template>

    <template #source>
      <AssetLogo class="!w-6 !h-6" />
    </template>

    <template #content>
      <div>
        <p class="text-gray-300 text-sm">
          {{ $t('campaign.activeBots') }}
        </p>
        <p class="text-lg font-semibold">
          <span v-if="activeBots.eq(0)">&mdash;</span>
          <span v-else>{{ activeBots.toFormat(0) }}</span>
        </p>
      </div>
    </template>
  </PartialsLiquidityProvisionItem>
</template>
