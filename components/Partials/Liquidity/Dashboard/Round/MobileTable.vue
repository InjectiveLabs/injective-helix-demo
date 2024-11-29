<script setup lang="ts">
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  UTableColumn,
  LiquidityRewardsPage,
  TransformedLiquidityDashboard,
  LiquidityDashboardTableColumn
} from '@/types'

const props = withDefaults(
  defineProps<{
    columns: UTableColumn[]
    campaign: TransformedLiquidityDashboard
  }>(),
  {}
)

const filteredColumns = computed(() =>
  props.columns.reduce((list, column) => {
    if (column.key === LiquidityDashboardTableColumn.Market) {
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
    grid-class="grid gap-6 grid-cols-2 sm:text-sm"
  >
    <template #header>
      <div class="flex items-start gap-2 mb-6 justify-between">
        <div class="flex flex-col gap-2">
          <p class="text-white text-sm font-semibold">
            {{
              $t(
                `campaign.table.dashboard.${LiquidityDashboardTableColumn.Market}`
              )
            }}
          </p>

          <NuxtLink
            :to="{
              name: LiquidityRewardsPage.CampaignDetails,
              query: { campaign: campaign?.campaignId }
            }"
            class="flex items-center space-x-2 hover:bg-coolGray-800 rounded-md transition-colors duration-300"
          >
            <div v-if="campaign.token">
              <CommonTokenIcon :token="campaign.token" />
            </div>
            <div>
              <p class="text-sm font-bold">
                {{ campaign.market?.ticker }}
              </p>
              <p class="text-xs text-coolGray-500">
                {{ campaign.market?.baseToken?.name }}
              </p>
            </div>
          </NuxtLink>
        </div>

        <PartialsLiquidityCommonClaimButton :campaign="campaign.campaign" />
      </div>
    </template>

    <template #volume-data>
      <div class="tracking-wider">
        <AppUsdAmount
          v-bind="{
            amount: campaign.marketVolumeInUsd.toFixed(),
            decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
          }"
        />
        <span class="ml-1">USD</span>
      </div>
    </template>

    <template #rewards-data>
      <div class="text-right">
        <p class="font-semibold mb-1">
          <AppUsdAmount
            v-bind="{
              amount: campaign.totalAmountInUsd.toFixed(),
              decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
            }"
          />
          <span class="ml-1">USD</span>
        </p>
        <div class="flex items-center space-x-2">
          <PartialsLiquidityCommonTokenAmount
            v-for="({ amount, symbol }, index) in campaign.rewards"
            :key="`${symbol}-${symbol}`"
            v-bind="{ amount: amount.toFixed(), symbol, index }"
          />
        </div>
      </div>
    </template>
  </AppMobileTable>
</template>
