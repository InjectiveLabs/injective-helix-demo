<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { LiquidityRewardsPage, LiquidityDashboardTableColumn } from '@/types'
import type { Campaign } from '@injectivelabs/sdk-ts'

const { t } = useLang()
const { lg } = useSharedBreakpoints()

const props = withDefaults(
  defineProps<{ isActive: boolean; campaigns: Campaign[] }>(),
  {}
)

const { rows } = useLiquidityDashboardTransformer(
  computed(() => props.campaigns)
)

const columns = computed(() => [
  {
    key: LiquidityDashboardTableColumn.Market,
    label: t(
      `lpRewards.table.dashboard.${LiquidityDashboardTableColumn.Market}`
    ),
    class: 'w-4/12'
  },
  {
    key: LiquidityDashboardTableColumn.Volume,
    label: t(
      `lpRewards.table.dashboard.${LiquidityDashboardTableColumn.Volume}`
    ),
    class: 'w-3/12'
  },
  {
    key: LiquidityDashboardTableColumn.Rewards,
    label: props.isActive
      ? t(
          `lpRewards.table.dashboard.${LiquidityDashboardTableColumn.EstRewards}`
        )
      : t(`lpRewards.table.dashboard.${LiquidityDashboardTableColumn.Rewards}`),
    class: 'w-3/12'
  },

  {
    key: LiquidityDashboardTableColumn.Action,
    class: 'w-2/12',
    rowClass: 'flex justify-end'
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
        <div class="tracking-wider text-sm">
          <SharedAmountUsd
            v-bind="{
              hideDecimals: true,
              shouldAbbreviate: false,
              roundingMode: BigNumberInBase.ROUND_UP,
              amount: row.marketVolumeInUsd.toFixed()
            }"
          />
          <span class="ml-1">USD</span>
        </div>
      </template>

      <template #rewards-data="{ row }">
        <div>
          <p class="font-semibold mb-1 text-sm">
            <SharedAmountUsd
              v-bind="{
                shouldAbbreviate: false,
                amount: row.totalAmountInUsd.toFixed()
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

      <template #empty-state>
        <div class="flex flex-col justify-center items-center py-10">
          <CommonEmptyList :message="t('lpRewards.noActiveCampaigns')" />
        </div>
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
