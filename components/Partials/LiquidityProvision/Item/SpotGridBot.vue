<script setup lang="ts">
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import {
  GridMarket,
  TradeSubPage,
  LiquidityProvisionType,
  TradingInterface
} from '@/types'

const props = defineProps({
  gridMarket: {
    type: Object as PropType<GridMarket>,
    required: true
  }
})

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
        `liquidityProvision.type.${LiquidityProvisionType.HelixSpotGridBot}`
      )
    }"
  >
    <template #default>
      <CommonTokenIcon is-lg v-bind="{ token: market?.baseToken }" />
      <div
        class="absolute border left-5 top-4 bg-white rounded-full grid place-items-center"
      >
        <AssetMitoLogo class="!w-5 !h-5" />
      </div>
    </template>

    <template #content>
      <div>
        <p>{{ $t('campaign.activeBots') }}</p>
        <p class="text-xl font-semibold">
          <span v-if="activeBots.eq(0)">&mdash;</span>
          <span v-else>{{ activeBots.toFormat(0) }}</span>
        </p>
      </div>
    </template>
  </PartialsLiquidityProvisionItem>
</template>
