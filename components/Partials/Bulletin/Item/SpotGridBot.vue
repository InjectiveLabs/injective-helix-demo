<script setup lang="ts">
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { GridMarket, TradeSubPage, TradingInterface } from '@/types'

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
  <NuxtLink v-if="market" :to="url" class="card px-4 py-6 hover:bg-gray-750">
    <div class="flex space-x-4">
      <div class="relative">
        <CommonTokenIcon is-lg v-bind="{ denom: market?.baseDenom }" />
        <div
          class="absolute border left-5 top-5 p-1 bg-white rounded-full grid place-items-center"
        >
          <AssetLogo class="!w-2.5 !h-2.5" />
        </div>
      </div>

      <div>
        <p class="text-xl font-semibold">{{ market.ticker }}</p>
        <p class="text-gray-400 text-xs">Helix - Trading Bot</p>
      </div>
    </div>

    <div class="grid grid-cols-2 mt-8">
      <div>
        <p>{{ $t('campaign.activeBots') }}</p>
        <p class="text-xl font-semibold">
          <span v-if="activeBots.eq(0)">-</span>
          <span v-else>{{ activeBots.toFormat(0) }}</span>
        </p>
      </div>
    </div>
  </NuxtLink>
</template>
