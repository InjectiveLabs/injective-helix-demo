<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { UI_DEFAULT_AGGREGATION_DECIMALS } from '@/app/utils/constants'
import { HistorySwapTableColumn } from '@/types'
import type { UTableColumn, TransformedHistorySwap } from '@/types'

const props = withDefaults(
  defineProps<{
    columns: UTableColumn[]
    swap: TransformedHistorySwap
  }>(),
  {}
)

const filteredColumns = computed(() =>
  props.columns.reduce((list, column) => {
    if (column.key === HistorySwapTableColumn.Action) {
      return list
    }

    list.push({ ...column, class: '' })

    return list
  }, [] as UTableColumn[])
)
</script>

<template>
  <AppMobileTable :columns="filteredColumns">
    <template #header>
      <div class="flex mb-6 justify-end">
        <a
          :href="swap.explorerLink"
          target="_blank"
          class="flex items-center gap-1.5 py-2 px-3 text-xs bg-blue-500 text-blue-900 border-blue-500 hover:bg-blue-500/70 hover:border-blue-500/70 disabled:bg-transparent disabled:text-coolGray-400 disabled:border-blue-500 focus-within:ring-[3px] ring-blue-700 rounded-lg font-medium"
        >
          <p>View Transaction</p>
          <UIcon :name="NuxtUiIcons.ExternalLink" class="h-3 w-3 min-w-3" />
        </a>
      </div>
    </template>

    <template #time-data>
      <p>{{ swap.time }}</p>
    </template>

    <template #outgoing-data>
      <div
        v-if="swap.sourceTokenWithBalance"
        class="flex items-center space-x-2"
      >
        <CommonTokenIcon
          v-if="
            swap.sourceTokenWithBalance.token &&
            swap.sourceTokenWithBalance.token
          "
          v-bind="{ token: swap.sourceTokenWithBalance.token }"
        />

        <div>
          <SharedAmount
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              amount: swap.sourceBalanceFormatted,
              decimals: UI_DEFAULT_AGGREGATION_DECIMALS
            }"
          />
          {{ swap.sourceTokenWithBalance.token.symbol }}
        </div>
      </div>
    </template>

    <template #incoming-data>
      <div
        v-if="swap.destinationTokenWithBalance"
        class="flex items-center space-x-2"
      >
        <CommonTokenIcon
          v-if="swap.destinationTokenWithBalance.token"
          v-bind="{ token: swap.destinationTokenWithBalance.token }"
        />

        <div>
          <SharedAmount
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              amount: swap.destinationBalanceFormatted,
              decimals: UI_DEFAULT_AGGREGATION_DECIMALS
            }"
          />
          {{ swap.destinationTokenWithBalance.token.symbol }}
        </div>
      </div>
    </template>

    <template #route-data>
      <div class="flex items-center space-x-1">
        <PartialsSwapRoute
          v-bind="{ isSm: true, routeSymbols: swap.routeSymbols }"
        />
      </div>
    </template>

    <template #fee-data>
      <div
        v-for="({ amount, symbol }, index) in swap.formattedFees"
        :key="`swap-history-${amount}-${symbol}-${index}`"
      >
        <SharedAmount v-bind="{ amount }" />
        <span class="ml-1">{{ symbol }}</span>
      </div>
    </template>
  </AppMobileTable>
</template>
