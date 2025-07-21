<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  TradingBotsSubPage,
  LiquidityRewardsPage,
  LiquidityTableColumn
} from '@/types'
import type { Campaign } from '@injectivelabs/sdk-ts'

const { t } = useLang()
const { lg } = useSharedBreakpoints()

const props = withDefaults(defineProps<{ campaigns: Campaign[] }>(), {})

const { rows } = useLiquidityTransformer(computed(() => props.campaigns))

const columns = computed(() => [
  {
    key: LiquidityTableColumn.Market,
    label: t(`lpRewards.table.liquidity.${LiquidityTableColumn.Market}`)
  },
  {
    key: LiquidityTableColumn.Rewards,
    label: t(`lpRewards.table.liquidity.${LiquidityTableColumn.Rewards}`)
  },
  {
    key: LiquidityTableColumn.ActiveBots,
    label: t(`lpRewards.table.liquidity.${LiquidityTableColumn.ActiveBots}`),
    class: 'text-right rtl:text-left'
  },
  {
    key: LiquidityTableColumn.Volume,
    label: t(`lpRewards.table.liquidity.${LiquidityTableColumn.Volume}`),
    class: 'text-right rtl:text-left'
  },
  {
    key: LiquidityTableColumn.Action
  }
])
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
                name: TradingBotsSubPage.LiquiditySpotMarket,
                query: { market: row.market?.slug }
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
              is-lg
              is-warning
              :content="$t('lpRewards.legacyBotWarning')"
            />
          </div>
        </div>
      </template>

      <template #rewards-data="{ row }">
        <div>
          <p class="font-semibold text-sm mb-2">
            <SharedAmountUsd
              v-bind="{
                shouldAbbreviate: false,
                amount: row.totalRewardsInUsd.toFixed()
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
                  index,
                  amount: reward.value,
                  symbol: reward.token.symbol
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
            <SharedAmountUsd
              v-bind="{
                hideDecimals: true,
                shouldAbbreviate: false,
                roundingMode: BigNumberInBase.ROUND_UP,
                amount: row.marketVolumeInUsd.toFixed()
              }"
            />
            <span class="ml-1">USD</span>
          </p>
        </div>
      </template>

      <template #action-data="{ row }">
        <div class="flex space-x-8 justify-end">
          <NuxtLink
            class="text-blue-500"
            :to="{
              name: LiquidityRewardsPage.CampaignDetails,
              query: { campaign: row.campaignId }
            }"
          >
            {{ $t('lpRewards.rewardsDetails') }}
          </NuxtLink>

          <NuxtLink
            class="text-blue-500"
            :to="{
              name: TradingBotsSubPage.LiquiditySpotMarket,
              query: { market: row.market?.slug }
            }"
          >
            {{ $t('lpRewards.addLiquidity') }}
          </NuxtLink>
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
