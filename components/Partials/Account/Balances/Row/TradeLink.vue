<script lang="ts" setup>
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { getMarketRoute } from '@/app/utils/market'
import { AccountBalance } from '@/types'

const spotStore = useSpotStore()

const props = defineProps({
  balance: {
    type: Object as PropType<AccountBalance>,
    required: true
  }
})

const filteredMarkets = computed<UiSpotMarketWithToken[]>(() =>
  spotStore.markets.filter(
    (m) =>
      m.baseDenom === props.balance.token.denom ||
      m.quoteDenom === props.balance.token.denom
  )
)

const filteredMarketsWithRoute = computed(() =>
  filteredMarkets.value.map((market) => ({
    ...market,
    route: getMarketRoute(market)
  }))
)
</script>

<template>
  <div>
    <NuxtLink
      v-if="filteredMarketsWithRoute.length === 1"
      class="rounded flex items-center justify-center w-auto h-auto cursor-pointer"
      :to="filteredMarketsWithRoute[0].route"
    >
      <span class="text-blue-500 text-sm font-medium cursor-pointer">
        {{ $t('account.trade') }}
      </span>
    </NuxtLink>

    <BaseDropdown
      v-else
      popper-class="rounded-lg flex flex-col flex-wrap text-xs absolute max-w-52 bg-gray-750 shadow-dropdown"
    >
      <template #default>
        <div
          class="rounded flex items-center justify-center w-auto h-auto cursor-pointer"
        >
          <span class="text-blue-500 text-sm font-medium cursor-pointer">
            {{ $t('account.trade') }}
          </span>
        </div>
      </template>

      <template #content>
        <div class="flex flex-col py-2">
          <NuxtLink
            v-for="market in filteredMarketsWithRoute"
            :key="market.slug"
            class="px-4 py-2 font-semibold text-sm uppercase cursor-pointer text-white hover:text-blue-500"
            :to="market.route"
          >
            {{ market.baseToken.symbol }}/{{ market.quoteToken.symbol }}
          </NuxtLink>
        </div>
      </template>
    </BaseDropdown>
  </div>
</template>
