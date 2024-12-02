<script setup lang="ts">
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  UTableColumn,
  PortfolioSubPage,
  TradingInterface,
  TradingBotsSubPage,
  LiquidityRewardsPage,
  TransformedLiquidity,
  LiquidityTableColumn
} from '@/types'

const props = withDefaults(
  defineProps<{
    columns: UTableColumn[]
    campaign: TransformedLiquidity
  }>(),
  {}
)

const filteredColumns = computed(() =>
  props.columns.reduce((list, column) => {
    const removedKey = [
      LiquidityTableColumn.Market,
      LiquidityTableColumn.Action
    ]

    if (removedKey.includes(column.key as LiquidityTableColumn)) {
      return list
    }

    list.push({ ...column, class: '' })

    return list
  }, [] as UTableColumn[])
)
</script>

<template>
  <AppMobileTable
    :columns="filteredColumns"
    class="first:pt-0"
    grid-class="grid gap-6 grid-cols-2 sm:grid-cols-3 sm:text-sm"
  >
    <template #header>
      <div class="flex items-start flex-wrap gap-2 mb-6 justify-between">
        <div class="flex flex-col gap-2">
          <p class="text-white text-sm font-semibold">
            {{ $t(`campaign.table.liquidity.${LiquidityTableColumn.Market}`) }}
          </p>

          <div class="flex items-center space-x-2">
            <NuxtLink
              :to="{
                name: PortfolioSubPage.OrdersSpotTradeHistory,
                params: { market: campaign.market?.slug },
                query: { interface: TradingInterface.TradingBots }
              }"
              class="flex items-center space-x-2 hover:bg-coolGray-800 rounded-md transition-colors duration-300"
            >
              <div v-if="campaign.baseToken">
                <CommonTokenIcon v-bind="{ token: campaign.baseToken }" />
              </div>
              <div>
                <p class="font-bold text-sm">
                  {{ campaign.market?.ticker }}
                </p>
                <p class="text-xs text-coolGray-500">
                  {{ campaign.market?.baseToken?.name }}
                </p>
              </div>
            </NuxtLink>

            <AppTooltip
              v-if="campaign.userHasActiveLegacyStrategy"
              is-warning
              :content="$t('sgt.legacyBotWarning')"
              is-lg
            />
          </div>
        </div>

        <div class="flex space-x-2">
          <NuxtLink
            class="flex items-center gap-1.5 py-2 px-3 text-xs bg-blue-500 text-blue-900 border-blue-500 hover:bg-blue-500/70 hover:border-blue-500/70 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-blue-500 focus-within:ring-[3px] ring-blue-700 rounded-lg font-medium"
            :to="{
              name: LiquidityRewardsPage.CampaignDetails,
              query: { campaign: campaign.campaignId }
            }"
          >
            {{ $t('campaign.rewardsDetails') }}
          </NuxtLink>

          <NuxtLink
            class="flex items-center gap-1.5 py-2 px-3 text-xs bg-blue-500 text-blue-900 border-blue-500 hover:bg-blue-500/70 hover:border-blue-500/70 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-blue-500 focus-within:ring-[3px] ring-blue-700 rounded-lg font-medium"
            :to="{
              name: TradingBotsSubPage.LiquiditySpotMarket,
              query: { market: campaign.market?.slug }
            }"
          >
            {{ $t('campaign.addLiquidity') }}
          </NuxtLink>
        </div>
      </div>
    </template>

    <template #rewards-data>
      <p class="font-semibold text-sm mb-0.5">
        <AppUsdAmount
          v-bind="{
            amount: campaign.totalRewardsInUsd.toFixed(),
            decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
          }"
        />
        <span class="ml-1">USD</span>
      </p>
      <div class="flex items-center space-x-2">
        <template
          v-for="(reward, index) in campaign.rewardsWithToken"
          :key="index"
        >
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
    </template>

    <template #active-bots-data>
      <PartialsLiquidityTableActiveBots :market="campaign.market" />
    </template>

    <template #volume-data>
      <p>
        <AppUsdAmount
          v-bind="{
            amount: campaign.marketVolumeInUsd.toFixed(),
            decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
          }"
        />
        <span class="ml-1">USD</span>
      </p>
    </template>
  </AppMobileTable>
</template>
