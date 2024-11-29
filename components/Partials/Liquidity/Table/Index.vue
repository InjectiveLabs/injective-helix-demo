<script setup lang="ts">
import { Campaign } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  PortfolioSubPage,
  TradingInterface,
  TradingBotsSubPage,
  LiquidityRewardsPage,
  LiquidityTableColumn
} from '@/types'

const { t } = useLang()
const { lg } = useTwBreakpoints()

const props = withDefaults(defineProps<{ campaigns: Campaign[] }>(), {})

const { rows } = useLiquidityTransformer(computed(() => props.campaigns))

const columns = [
  {
    key: LiquidityTableColumn.Market,
    label: t(`campaign.table.liquidity.${LiquidityTableColumn.Market}`)
  },
  {
    key: LiquidityTableColumn.Rewards,
    label: t(`campaign.table.liquidity.${LiquidityTableColumn.Rewards}`)
  },
  {
    key: LiquidityTableColumn.ActiveBots,
    label: t(`campaign.table.liquidity.${LiquidityTableColumn.ActiveBots}`),
    class: 'text-right rtl:text-left'
  },
  {
    key: LiquidityTableColumn.Volume,
    label: t(`campaign.table.liquidity.${LiquidityTableColumn.Volume}`),
    class: 'text-right rtl:text-left'
  }
]
</script>

<template>
  <template v-if="lg">
    <UTable
      :rows="rows"
      :columns="columns"
      :ui="{
        divide: 'divide-y-0',
        th: {
          base: 'uppercase',
          padding: 'p-2'
        },
        td: { padding: 'py-6 px-4', size: 'text-sm' }
      }"
    >
      <template #market-data="{ row }">
        <div class="flex items-center gap-1">
          <div class="flex items-center space-x-2">
            <NuxtLink
              :to="{
                name: PortfolioSubPage.OrdersSpotTradeHistory,
                params: { market: row.market?.slug },
                query: { interface: TradingInterface.TradingBots }
              }"
              class="flex items-center space-x-2 hover:bg-coolGray-800 rounded-md transition-colors duration-300 p-2"
            >
              <div v-if="row.baseToken">
                <CommonTokenIcon v-bind="{ token: row.baseToken }" />
              </div>
              <div>
                <p class="font-bold">
                  {{ row.market?.ticker }}
                </p>
                <p class="text-xs text-coolGray-500">
                  {{ row.market?.baseToken?.name }}
                </p>
              </div>
            </NuxtLink>

            <AppTooltip
              v-if="row.userHasActiveLegacyStrategy"
              is-warning
              :content="$t('sgt.legacyBotWarning')"
              is-lg
            />
          </div>

          <AppTablePopover>
            <div
              class="flex flex-col gap-1.5 rounded-lg p-2 bg-brand-800 min-w-28"
            >
              <NuxtLink
                class="p-2 text-sm transition-all rounded-md font-semibold bg-transparent text-coolGray-200 hover:text-white hover:bg-blue-500/20 focus-within:ring-[3px] ring-blue-700"
                :to="{
                  name: LiquidityRewardsPage.CampaignDetails,
                  query: { campaign: row.campaignId }
                }"
              >
                {{ $t('campaign.rewardsDetails') }}
              </NuxtLink>

              <NuxtLink
                class="p-2 text-sm transition-all rounded-md font-semibold bg-transparent text-coolGray-200 hover:text-white hover:bg-blue-500/20 focus-within:ring-[3px] ring-blue-700"
                :to="{
                  name: TradingBotsSubPage.LiquiditySpotMarket,
                  query: { market: row.market?.slug }
                }"
              >
                {{ $t('campaign.addLiquidity') }}
              </NuxtLink>
            </div>
          </AppTablePopover>
        </div>
      </template>

      <template #rewards-data="{ row }">
        <div>
          <p class="font-semibold text-base mb-2">
            <AppUsdAmount
              v-bind="{
                amount: row.totalRewardsInUsd.toFixed(),
                decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
            />
            <span class="ml-1">USD</span>
          </p>
          <div class="flex items-center space-x-2">
            <template
              v-for="(reward, index) in row.rewardsWithToken"
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
        </div>
      </template>

      <template #active-bots-data="{ row }">
        <PartialsLiquidityTableActiveBots :market="row.market" />
      </template>

      <template #volume-data="{ row }">
        <div class="text-right">
          <p>
            <AppUsdAmount
              v-bind="{
                amount: row.marketVolumeInUsd.toFixed(),
                decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
            />
            <span class="ml-1">USD</span>
          </p>
        </div>
      </template>
    </UTable>
  </template>

  <template v-else>
    <PartialsLiquidityMobileTable
      v-for="campaign in rows"
      :key="campaign.campaignId"
      v-bind="{ campaign, columns }"
    />
  </template>
</template>
