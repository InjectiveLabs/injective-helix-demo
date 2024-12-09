<script setup lang="ts">
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { Status, StatusType } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { BotType } from '@/types'

const gridStrategyStore = useGridStrategyStore()
const { $onError } = useNuxtApp()
const { t } = useLang()

const selected = ref<string | BotType>('all')
const status = reactive(new Status(StatusType.Loading))

const formattedStrategies = useSpotGridStrategies(
  computed(() => gridStrategyStore.activeStrategies)
)

const items = computed(() => [
  {
    label: `${t('tradingBots.all')} (${formattedStrategies.value.length})`,
    value: 'all'
  },
  {
    label: `${t('tradingBots.spotGrid')} (${
      formattedStrategies.value.filter(
        (strategy) => strategy.botType === BotType.SpotGrid
      ).length
    })`,
    value: BotType.SpotGrid
  },
  {
    label: `${t('tradingBots.futuresGrid')} (${
      formattedStrategies.value.filter(
        (strategy) => strategy.botType === BotType.FuturesGrid
      ).length
    })`,
    value: BotType.FuturesGrid
  },
  {
    label: `${t('tradingBots.liquidityGrid')} (${
      formattedStrategies.value.filter(
        (strategy) => strategy.botType === BotType.LiquidityGrid
      ).length
    })`,
    value: BotType.LiquidityGrid
  }
])

const value = computed({
  get: () => items.value.findIndex((item) => item.value === selected.value),
  set: (value) => {
    selected.value = items.value[value].value
  }
})

const totalAssets = computed(() =>
  formattedStrategies.value.reduce(
    (totalValue, { currentUsdValue }) => totalValue.plus(currentUsdValue),
    ZERO_IN_BASE
  )
)

const filteredStrategies = computed(() =>
  formattedStrategies.value.filter((strategy) => {
    if (selected.value === 'all') {
      return true
    }

    return strategy.botType === selected.value
  })
)

const totalPnl = computed(() => {
  if (formattedStrategies.value.length === 0) {
    return ZERO_IN_BASE
  }

  const initialAmount = formattedStrategies.value.reduce((acc, curr) => {
    return acc.plus(curr.initialUsdValue)
  }, ZERO_IN_BASE)

  const currentAmount = formattedStrategies.value.reduce((acc, curr) => {
    return acc.plus(curr.currentUsdValue)
  }, ZERO_IN_BASE)

  const pnlPercentage = currentAmount.minus(initialAmount).div(initialAmount)

  return pnlPercentage.times(100)
})

onMounted(() => {
  status.setLoading()

  gridStrategyStore
    .fetchAllStrategies({ active: true })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <UCard :ui="{ background: 'dark:bg-brand-875' }">
    <USkeleton v-if="status.isLoading()" class="h-52 w-full" />

    <div v-else class="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">
      <div class="space-y-2">
        <h3 class="text-xl font-semibold mb-4">
          {{ t('tradingBots.activeBots') }}
          ({{ formattedStrategies.length }})
        </h3>
        <p class="text-xs text-zinc-500">{{ $t('tradingBots.totalAssets') }}</p>
        <p class="text-xl font-bold">
          <SharedAmountFormatter
            :amount="totalAssets.toFixed()"
            :decimal-places="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
            :max-decimal-places="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
          />
        </p>
        <p class="text-xs text-zinc-500">{{ $t('tradingBots.totalPnl') }}</p>
        <p class="text-xl font-bold">
          <span
            :class="{
              'text-green-500': totalPnl.gt(0),
              'text-red-500': totalPnl.lt(0)
            }"
          >
            {{ totalPnl.toFixed(2) }}%
          </span>
        </p>
      </div>

      <div class="flex-1 lg:pl-8">
        <UTabs v-model="value" :items="items" />
        <div class="border-t border-gray-700 -mt-2.5" />

        <div
          v-if="filteredStrategies.length === 0"
          class="flex justify-center items-center py-10"
        >
          <p class="text-sm text-zinc-500">
            {{ t('tradingBots.noActiveBots') }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
          <PartialsTradingBotsHomepageMyActiveBotsCard
            v-for="strategy in filteredStrategies"
            :key="strategy.subaccountId"
            :strategy="strategy"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>
