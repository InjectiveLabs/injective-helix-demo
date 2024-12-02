<script setup lang="ts">
import { Campaign } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { LiquidityRewardsPage, LiquidityDashboardTableColumn } from '@/types'

const { t } = useLang()
const { lg } = useTwBreakpoints()

const props = withDefaults(
  defineProps<{ isActive: boolean; campaigns: Campaign[] }>(),
  {}
)

const { rows } = useLiquidityDashboardTransformer(
  computed(() => props.campaigns)
)

const columns = [
  {
    key: LiquidityDashboardTableColumn.Market,
    label: t(
      `campaign.table.dashboard.${LiquidityDashboardTableColumn.Market}`
    ),
    class: 'w-4/12'
  },
  {
    key: LiquidityDashboardTableColumn.Volume,
    label: t(
      `campaign.table.dashboard.${LiquidityDashboardTableColumn.Volume}`
    ),
    class: 'w-3/12'
  },
  {
    key: LiquidityDashboardTableColumn.Rewards,
    label: props.isActive
      ? t(
          `campaign.table.dashboard.${LiquidityDashboardTableColumn.EstRewards}`
        )
      : t(`campaign.table.dashboard.${LiquidityDashboardTableColumn.Rewards}`),
    class: 'w-3/12'
  },

  {
    key: LiquidityDashboardTableColumn.Action,
    class: 'w-2/12'
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
        tbody: 'divide-y-0',
        th: {
          base: 'uppercase',
          padding: 'px-2'
        },
        td: {
          padding: 'py-2',
          size: 'text-base'
        }
      }"
    >
      <template #market-data="{ row }">
        <div class="flex items-center gap-1">
          <NuxtLink
            :to="{
              name: LiquidityRewardsPage.CampaignDetails,
              query: { campaign: row?.campaignId }
            }"
            class="flex items-center space-x-2 hover:bg-coolGray-800 rounded-md transition-colors duration-300 p-2"
          >
            <div v-if="row.token">
              <CommonTokenIcon :token="row.token" />
            </div>
            <div>
              <p class="text-sm font-bold">
                {{ row.market?.ticker }}
              </p>
              <p class="text-xs text-coolGray-500">
                {{ row.market?.baseToken?.name }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </template>

      <template #volume-data="{ row }">
        <div class="tracking-wider">
          <AppUsdAmount
            v-bind="{
              amount: row.marketVolumeInUsd.toFixed(),
              decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
            }"
          />
          <span class="ml-1">USD</span>
        </div>
      </template>

      <template #rewards-data="{ row }">
        <div>
          <p class="font-semibold mb-1">
            <AppUsdAmount
              v-bind="{
                amount: row.totalAmountInUsd.toFixed(),
                decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
            />
            <span class="ml-1">USD</span>
          </p>
          <div class="flex items-center space-x-2">
            <PartialsLiquidityCommonTokenAmount
              v-for="({ amount, symbol }, index) in row.rewards"
              :key="`${symbol}-${symbol}`"
              v-bind="{ amount: amount.toFixed(), symbol, index }"
            />
          </div>
        </div>
      </template>

      <template #action-data="{ row }">
        <PartialsLiquidityCommonClaimButton
          v-bind="{
            campaign: row.campaign
          }"
        />
      </template>
    </UTable>
  </template>

  <template v-else>
    <PartialsLiquidityDashboardRoundMobileTable
      v-for="campaign in rows"
      :key="campaign.campaignId"
      v-bind="{ campaign, columns }"
    />
  </template>
</template>
