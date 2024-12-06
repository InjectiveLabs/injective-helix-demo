<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { AtomicSwap } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_AGGREGATION_DECIMALS } from '@/app/utils/constants'
import { HistorySwapTableColumn } from '@/types'

const { t } = useLang()
const { lg } = useTwBreakpoints()

const props = withDefaults(
  defineProps<{
    swaps: AtomicSwap[]
  }>(),
  {}
)

const { rows } = useHistorySwapTransformer(computed(() => props.swaps))

const columns = [
  {
    key: HistorySwapTableColumn.Time,
    label: t(`activity.table.historySwap.${HistorySwapTableColumn.Time}`)
  },
  {
    key: HistorySwapTableColumn.Outgoing,
    label: t(`activity.table.historySwap.${HistorySwapTableColumn.Outgoing}`)
  },
  {
    key: HistorySwapTableColumn.Incoming,
    label: t(`activity.table.historySwap.${HistorySwapTableColumn.Incoming}`)
  },
  {
    key: HistorySwapTableColumn.Route,
    label: t(`activity.table.historySwap.${HistorySwapTableColumn.Route}`)
  },
  {
    key: HistorySwapTableColumn.Fee,
    label: t(`activity.table.historySwap.${HistorySwapTableColumn.Fee}`)
  },
  {
    key: HistorySwapTableColumn.Action
  }
]
</script>

<template>
  <template v-if="lg">
    <UTable
      :rows="rows"
      :columns="columns"
      :ui="{ base: 'w-full', th: { base: 'w-1/5' } }"
    >
      <template #time-data="{ row }">
        <div class="p-2 flex items-center">
          {{ row.time }}
        </div>
      </template>

      <template #outgoing-data="{ row }">
        <div
          v-if="row.sourceTokenWithBalance"
          class="p-2 flex items-center space-x-2"
        >
          <CommonTokenIcon
            v-if="
              row.sourceTokenWithBalance.token &&
              row.sourceTokenWithBalance.token
            "
            v-bind="{ token: row.sourceTokenWithBalance.token }"
          />

          <div>
            <AppAmount
              v-bind="{
                amount: row.sourceBalanceFormatted,
                decimalPlaces: UI_DEFAULT_AGGREGATION_DECIMALS
              }"
              class="font-mono"
            />
            {{ row.sourceTokenWithBalance.token.symbol }}
          </div>
        </div>
      </template>

      <template #incoming-data="{ row }">
        <div
          v-if="row.destinationTokenWithBalance"
          class="flex items-center p-2 space-x-2"
        >
          <CommonTokenIcon
            v-if="row.destinationTokenWithBalance.token"
            v-bind="{ token: row.destinationTokenWithBalance.token }"
          />

          <div>
            <AppAmount
              v-bind="{
                amount: row.destinationBalanceFormatted,
                decimalPlaces: UI_DEFAULT_AGGREGATION_DECIMALS
              }"
              class="font-mono"
            />
            {{ row.destinationTokenWithBalance.token.symbol }}
          </div>
        </div>
      </template>

      <template #route-data="{ row }">
        <div class="p-2 flex items-center space-x-1">
          <PartialsSwapRoute
            v-bind="{ isSm: true, routeSymbols: row.routeSymbols }"
          />
        </div>
      </template>

      <template #fee-data="{ row }">
        <div class="p-2 flex items-center gap-1">
          <div
            v-for="({ amount, symbol }, index) in row.formattedFees"
            :key="`${amount}-${symbol}-${index}`"
          >
            <AppAmount v-bind="{ amount }" class="font-mono" />
            <span class="ml-1">{{ symbol }}</span>
          </div>
        </div>
      </template>

      <template #action-data="{ row }">
        <div class="p-2 flex items-center">
          <NuxtLink
            class="w-full text-white"
            :to="row.explorerLink"
            target="_blank"
          >
            <div class="flex items-center justify-center">
              <UIcon :name="NuxtUiIcons.ExternalLink" class="h-3 w-3 min-w-3" />
            </div>
          </NuxtLink>
        </div>
      </template>
    </UTable>
  </template>

  <template v-else>
    <PartialsPortfolioHistorySwapMobileTable
      v-for="swap in rows"
      :key="swap.txHash"
      v-bind="{ swap, columns }"
    />
  </template>
</template>
